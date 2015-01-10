/**
 * Copyright 2014 ブドウの鳥 [develo.pe]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
 
'use strict';

;(function(exports) {

	require( __dirname + '/injection' );
	require( __dirname + '/prototype' );

	exports.serverPort = process.env.PORT || 3000;
	exports.requestMethods = [ 'get', 'post', 'put', 'delete', 'head' ].toObject();

	exports.createServer = function(callback) {

		if ( !exports.existsServer ) {

			var server = require('express')(),
				router = require(__dirname + '/router');

			router.listen( server );
			exports.existsServer = server.listen( exports.serverPort , callback);

		}

		return exports.existsServer;
	}

	exports.terminateServer = function() {

		if ( !exports.existsServer ) {
			return
		}

		exports.existsServer.close()
	}

	exports.requestServer = function() {

		var request = require('request'),
			done = function() {},
			method = exports.requestMethods.get,
			path = '/';

		for ( var i = 0 ; i < arguments.length; i++ ) {
			var arg = arguments[i];
			if ( typeof arg == 'function' ) {
				done = arg;
			} else if ( typeof arg == 'string' ) {
				if ( exports.requestMethods[ arg.toLowerCase() ] ) {
					method = arg;
				} else {
					path = arg;
				}
			}
		}

		request({
			method: method.toUpperCase(),
			uri: 'http://127.0.0.1:' + exports.serverPort + path
		}, done)
	}

})( exports || this );

