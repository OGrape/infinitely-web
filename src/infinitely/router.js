/**
 * Copyright 2014 ブドウの鳥 [develo.pe]
 *
 * Licensed under the Apache License, Version 2.0 (the 'License");
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

exports.listen = function(app) {

	var bodyParser = require('body-parser'),
		cons = require('consolidate'),

		nodemailer = require('nodemailer');

	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: settings.gmail.username,
	        pass: settings.gmail.password
	    }
	});

	app.use(function(req, res, next) {
	    next();
	});

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	app.engine('dot', cons.dot);

	app.set('views', __dirname + '/__template');
	app.set('view engine', 'dot');

	app.use(require('express').static(__dirname + '/__public'));

	app.get('/*', function (req, res) {
		res.render('pages/home', variables);
	});

	app.post('/shoot', function(req, res) {
		var name = req.body.name || '',
			email = req.body.email || '',
			message = req.body.message || '';
		var msg = {
			success: false
		};
		res.setHeader('Content-Type', 'application/json');
		if (typeof name == 'string' && !name.trim()) {
			msg.error = 'Please enter your name buddy';
			res.end(JSON.stringify(msg));
		} else if (typeof email == 'string' && !email.trim()) {
			msg.error = 'Please enter your email buddy';
			res.end(JSON.stringify(msg));
		} else if (typeof email == 'string' && !(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/.test(email))) {
			msg.error = 'Sorry! It seems like your email address is wrong';
			res.end(JSON.stringify(msg));
		} else if (typeof message == 'string' && !message.trim()) {
			msg.error = 'Haha I thought you are gonna tell me something';
			res.end(JSON.stringify(msg));
		} else {
			var mailOptions = {
			    from: name + ' <' + email + '>',
			    to: settings.gmail.username,
			    subject: 'Infinitely Request',
			    html: [
			    	'<p> Name    : ' + name + '</p>',
			    	'<p> Email   : ' + email + '</p>',
			    	'<p> Message : ' + message + '</p>'
			    ].join('')
			};
			transporter.sendMail(mailOptions, function(error, info){
			    if (error) {
					msg.success = false;
					msg.error = error;
			    } else {
					msg.success = true;
			    }
				res.end(JSON.stringify(msg));
			});
		}
	});

};