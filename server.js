/* Copyright IBM Corp. 2014 All Rights Reserved                      */

var http = require('http');

// Bring in the module providing the wrapper for cf env
var cfenv = require('./cfenv-wrapper');

// Initialize the cfenv wrapper
var appEnv = cfenv.getAppEnv();

// Create a call back to respond to requests. Our
// callback just puts information retrieved with the
// cfenv wrapper onto a simple web page
var server = http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	
	res.write('Information retrieved using cfenv:\n\n');

	// Basic info provided by cfenv
	res.write('BASE_INFO\n');
	res.write('---------\n');
	res.write('Is Local: ' + appEnv.isLocal + '\n');
	res.write('App Name: ' + appEnv.name + '\n');
	res.write('Port: ' + appEnv.port  + '\n');
	res.write('Bind: ' + appEnv.bind  + '\n');
	res.write('URL: ' + appEnv.url  + '\n');
	
	// Service info provided by cfenv
	res.write('\n');
	res.write('SERVICES\n');
	res.write('--------\n');
	var services = appEnv.getServices();
	var count = 0;
	for (var serviceName in services) {
		if (services.hasOwnProperty(serviceName)) {
			count++;
			var service = services[serviceName];
			res.write(service.name + '\n');
		}
	}
	if (!count) {
		res.write('No services are bound to this app.\n');
	}
	
	// Get environment variables using my new functions for 
	// environment var access
	res.write('\n');
	res.write('ENVIRONMENT VARIABLES\n');
	res.write('----------------------------\n');
	var envVars = appEnv.getEnvVars();
	count = 0;
	for (var key in envVars) {
		if (!envVars.hasOwnProperty || envVars.hasOwnProperty(key)) {
			if (key !== 'VCAP_SERVICES' && key !== 'VCAP_APPLICATION') {
				count++;
				var envVar = appEnv.getEnvVar(key); // Could just do envVars[key], but want to exercise getEnvVar
				res.write(key + ':' + envVar + '\n');
			}
		}
	}
	if (!count) {
		res.write('No environment variables for this app.\n');
	}

	res.end();
}).listen(appEnv.port, appEnv.bind);

//start the server on the given port and binding host, and print
//url to server when it starts
server.listen(appEnv.port, appEnv.bind, function() {
	console.log('server starting on ' + appEnv.url);
});