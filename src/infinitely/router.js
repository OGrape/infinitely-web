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

	var cons = require('consolidate');

	app.use(function(req, res, next) {
	    next();
	});

	app.engine('dot', cons.dot);

	app.set('views', __dirname + '/__template');
	app.set('view engine', 'dot');

	app.use(require('express').static(__dirname + '/__public'));

	app.get('/*', function (req, res) {
		res.render('pages/home', variables);
	})

};