node-cfenv-wrapper
==================
Overview
--------
I'm a fan of the [`cfenv`](https://github.com/cloudfoundry-community/node-cfenv) package for [Node.js](http://nodejs.org/) written by [Patrick Mueller](https://twitter.com/pmuellr). It parses environment info in a [Bluemix](https://www.bluemix.net) (or [Cloud Foundry](http://cloudfoundry.org/)) application,, and provides functions to make it easy to retrieve all of the service attributes you need from [`VCAP_SERVICES`](https://www.ng.bluemix.net/docs/#cli/index.html#retrieving). It also gives access to other important attributes for port, host name/ip address, URL of the application, etc. On top of that, it detects whether your app is running locally or in the cloud. And, when running locally, it provides handy defaults. 

I've written a simple wrapper (a local module called `cfenv-wrapper`) to make local development of Bluemix/Cloud Foundry apps a little easier. My code parses a local copy of your app's `env.log` file, and extracts the data for `VCAP_SERVICES` and `VCAP_APPLICATION`. Then, it passes that information to `cfenv`'s initialization function, <code>getAppEnv</code>. After this initialization, you can use the same `cfenv` interface just as if you were running in the cloud.

**NOTE:** Many cloud services can be accessed with no changes when running locally. In Bluemix, a partial list of these includes [Cloudant](https://ace.ng.bluemix.net/#/store/cloudOEPaneId=store&serviceOfferingGuid=14c83ad2-6fd4-439a-8c3a-d1a20f8a2381), [Pitney Bowes](https://ace.ng.bluemix.net/#/store/cloudOEPaneId=store&serviceOfferingGuid=44698cab-8ca0-414b-9b6d-a0f4ac1277da), and [Twilio](https://ace.ng.bluemix.net/#/store/cloudOEPaneId=store&serviceOfferingGuid=bc6f7b08-5589-4f43-86da-90b710bd81af). In those cases, you can use `env.log` as is. However, there are services that don't yet allow connections from outside of Bluemix. For those services, you would need to modify `env.log` so that it uses info specific to installations of those services in your local environment.

New Functions
-------------
My wrapper also adds two new functions, not in the original `cfenv` interface:

* `getEnvVars` -- returns JSON data structure containing all environment variables. When running locally, it returns the data from the `env.log`. When running in the cloud, it will return the standard `process.env` runtime variable.
* `getEnvVar(name)` -- returns value of the environment variable with the given name. When running locally, it will try to pull the value from the `env.log` file data. If it can't find it, it falls back to the standard `process.env` runtime variable.

These serve to give you a consistent interface for environment variable resolution in both environments.

Run Live Demo
=============
You can run a a working deployment of the code on Bluemix by using the link below:

* [http://cfenv-wrapper.mybluemix.net/](http://cfenv-wrapper.mybluemix.net/)

Get the Code
============
You need to get the code onto your machine in order to run your own copy on Bluemix, another Cloud Foundry-based environment, or locally. You have two main options:

* Use the zip archive for this repository:
	1. Download [master.zip](https://github.com/aerwin/node-cfenv-wrapper/archive/master.zip)
	2. Extract to the directory of your choice which should create a directory called `node-cfenv-wrapper-master`
	3. Run `cd node-cfenv-wrapper-master`

OR

* Use `git clone` from the command line:
	1. `cd` to the parent directory you want to install the project in 
	2. Run `git clone https://github.com/aerwin/node-cfenv-wrapper.git`
	3. Run `cd node-cfenv-wrapper/`

Running on Bluemix
==================
Prerequisites
-------------
Before installing the code to Bluemix you will need to:

1.  Register for an account at [www.bluemix.net](https://www.bluemix.net). If you don't already have an account you can register for a free trial without a credit card.
2.  Install the `cf` command line tool: https://github.com/cloudfoundry/cli/releases

Log Into Bluemix
----------------
If you are not logged into Bluemix, then you should do the following from the command line:

1. Set the `cf` target: `cf api https://api.ng.bluemix.net`
2. Log into Bluemix: `cf login`

Push the Code
-------------
Now that you are logged in, you should be able to push your code to Bluemix by simply running:

	cf push

You should then see a bunch of console output that eventually ends with something like the what is shown below. NOTE: the string `${random-word}` was included as a placeholder in the `manifest.yml` file so that a unique route (or URL) would be created for your app. So, where you see `${random-word}` in the output, you will actually see a randomly chosen word.

	Showing health and status for app cfenv-wrapper in org 	aerwin@us.ibm.com / space test as aerwin@us.ibm.com...
	OK

	requested state: started
	instances: 1/1
	usage: 128M x 1 instances
	urls: cfenv-wrapper-${random-word}.mybluemix.net

     state     since                    cpu    memory          disk   
	#0   running   2014-10-04 03:19:59 PM   0.0%   15.7M of 128M   25.1M of 1G 

After the successful push, you should be able to run your app by pointing your browser at:

	http://cfenv-wrapper-${random-word}.mybluemix.net/
	
If everything works, the page in the browser should show something like the following (notice `Is Local` is `false`):

	BASE_INFO
	---------
	Is Local: false
	App Name: cfenv-wrapper
	Port: 61400
	Bind: 0.0.0.0
	URL: https://cfenv-wrapper.mybluemix.net
	
	SERVICES
	--------
	No services are bound to this app.

	ENVIRONMENT VARIABLES
	----------------------------
	TMPDIR:/home/vcap/tmp
	VCAP_APP_PORT:61321
	USER:vcap
	PATH:/home/vcap/app/vendor/node/bin:/home/vcap/app/bin:/home/vcap/app/node_modules/.bin:/bin:/usr/bin
	PWD:/home/vcap/app
	SHLVL:1
	HOME:/home/vcap/app
	PORT:61321
	VCAP_APP_HOST:0.0.0.0
	MEMORY_LIMIT:128m
	_:/home/vcap/app/vendor/node/bin/node
	OLDPWD:/home/vcap

If you start binding services or adding environment variables to your app, then you'll see additional data in the SERVICES and ENVIRONMENT VARIABLES sections when you refresh the page.

	Information retrieved using cfenv:
	
	BASE_INFO
	---------
	Is Local: false
	App Name: cfenv-wrapper
	Port: 61400
	Bind: 0.0.0.0
	URL: https://cfenv-wrapper.mybluemix.net
	
	SERVICES
	--------
	CloudantNoSQLDB

	CUSTOM ENVIRONMENT VARIABLES
	----------------------------
	MY_ENVIRONMENT_VARIABLE: Bluemix rules
	...

Running Locally
===============
Retrieving `env.log`
--------------------
To see the contents of `env.log`, you can run the following `cf` command:

	cf files APP_NAME logs/env.log

Then, copy the output into a file named `env.log` to the same place on your local file system that you put the code. That is, as a peer to the `server.js` file.

Install Dependencies
--------------------
Assuming you have already [downloaded and installed](http://nodejs.org/download/) Node.js (which also includes `npm`), then you can run the following command from the code directory (the one containing `server.js`) to retrieve dependencies:

	npm install

Execute `node` Command
----------------------
Once dependencies are installed, you can run the following command from the code directory:

	node server.js

Then, point your browser at the URL that is shown in the console output (e.g., something like `http://localhost:6001`). You should see similar kinds of information that you saw when running in the cloud. However, the top part will be different (e.g., `Is Local` will be `true` and port/url will be changed). But, the SERVICES and ENVIRONMENT VARIABLES sections should reflect whatever was in your `env.log` file:

	Information retrieved using cfenv:
	
	BASE_INFO
	---------
	Is Local: true
	App Name: cfenv-wrapper
	Port: 6001
	Bind: 0.0.0.0
	URL: http://localhost:6001
	...


License
===================
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
