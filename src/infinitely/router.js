
'use strict';

exports.listen = function(app) {

	app.use(function(req, res, next) {
	    next();
	});

	app.engine('.ejs', require('ejs').__express);

	app.set('views', __dirname + '/__template');
	app.set('view engine', 'ejs');

	app.use(require('express').static(__dirname + '/__public'));

	app.get('/*', function (req, res) {
		res.render('pages/home');
	})

};