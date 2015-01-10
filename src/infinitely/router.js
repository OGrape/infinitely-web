
'use strict';

exports.listen = function(app) {

	app.get('/*', function (req, res) {
		res.send('Hello World')
	})

};