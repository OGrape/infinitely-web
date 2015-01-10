'use strict';

var chai = require('chai');

var http = require('../dist/http');

describe('User API',function() {

	before(function(done) {
		http.createServer(done)
	});

	after(function() {
		http.terminateServer()
	})

	it('GET / should return 200', function(done) {
		http.requestServer(function(error, response, body) {
			chai.expect(response.statusCode).to.equal(200);
			done()
		})
	});

});