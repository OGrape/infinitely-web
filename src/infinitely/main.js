
'use strict';

var http = require( __dirname + '/http' )

http.createServer(function() { 
	console.log( 'Listening at 127.0.0.1:' + http.serverPort );
});
