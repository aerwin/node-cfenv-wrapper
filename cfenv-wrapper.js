/* Copyright IBM Corp. 2014 All Rights Reserved                      */

var cfenv = require('cfenv');
var properties = require ('node-properties-parser');

module.exports = (function() {
	var ENV_LOG_FILE = 'env.log';
	
	var appEnv;
	var envLog;

	// Short utility function to read env.log file out of
	// root directory
	function getEnvLog() {
		return properties.readSync(ENV_LOG_FILE);
	}

	// Initialize based on whether running locally or in cloud.
	function init() {
		if (!process.env.VCAP_SERVICES) {
			// running locally
			try {
				envLog = getEnvLog();

				var options = {
					// provide values for the VCAP_APPLICATION and VCAP_SERVICES environment
					// variables based on parsing values in the env.log file
					vcap: {
						application: JSON.parse(envLog.VCAP_APPLICATION),
						services: JSON.parse(envLog.VCAP_SERVICES)
					},
				};
				appEnv = cfenv.getAppEnv(options);
			} catch (err) {
				// Some kind of problem reading the file or parsing the JSON
				console.warn('Could not read configuration file: ' + err);
			}
		}
		
		if (!appEnv) {
			// We're either running in the cloud or env.log could not be
			// loaded. So, just let cfenv process VCAP_SERVICES and 
			// VCAP_APPLICATION for us
			appEnv = cfenv.getAppEnv();
		}
	}
	init();
	
	/*
	 * Expose a getAppEnv function that returns a wrapped cfenv.
	 */
	return {
		getAppEnv: function() {
			if (appEnv) {
				return {
					app: appEnv.app,
					services: appEnv.services,
					isLocal: appEnv.isLocal,
					name: appEnv.name,
					port: appEnv.port,
					bind: appEnv.bind,
					urls: appEnv.urls,
					url: appEnv.url,
			
					getServices: function() {
						// pass-through to cfenv
						return appEnv.getServices();
					},
			
					getService: function(name) {
						// pass-through to cfenv
						return appEnv.getService(name);
					},
			
					getServiceURL: function(name, replacements) {
						// pass-through to cfenv
						return appEnv.getServiceURL(name, replacements);
					},
					
					getServiceCreds: function(spec) {
						// pass-through to cfenv
						return appEnv.getServiceCreds(spec);
					},
					
					/* Unlike the others, this function isn't a wrapper
					 * on cfenv. If we're runnning locally, first try to
					 * get the value out of the parsed env.log info. 
					 * Otherwise (or if not found), look at process.env.
					 */
					getEnvVar: function(name) {
						var value;
						if (envLog) {
							value = envLog[name];
						}
						
						if (!value) {
							value = process.env[name];
						}
						
						return value;
					}
				};
			} else {
				// Problem getting the environment
				return null;
			}
		}
	};
}());