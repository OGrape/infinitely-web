
'use strict';

;(function(exports) {

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

