var http = require('http');
var cfenv = require('./cfenv-wrapper');

// Initialize the wrapped cf-env
var appEnv = cfenv.getAppEnv();

// Create a call back to respond to requests. Our
// callback just spits stuff out of the wrapped
// cfenv.
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
	for (var key in services) {
		if (services.hasOwnProperty(key)) {
			count++;
			var service = services[key];
			res.write(service.name + '\n');
		}
	}
	if (!count) {
		res.write('No services are bound to this app.\n');
	}
	
	// Example of getting an environment variable with my
	// extension of cfenv
	res.write('\n');
	res.write('CUSTOM ENVIRONMENT VARIABLES\n');
	res.write('----------------------------\n');
	res.write('MY_ENVIRONMENT_VARIABLE: ' + appEnv.getEnvVar('MY_ENVIRONMENT_VARIABLE')  + '\n');
  
	res.end();
}).listen(appEnv.port, appEnv.bind);

//start the server on the given port and binding host, and print
//url to server when it starts
server.listen(appEnv.port, appEnv.bind, function() {
	console.log('server starting on ' + appEnv.url);
});