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

(function( exports ) {

	var fs = require('fs'),
		__configfile;

	if (fs.existsSync('config.json')) {
		__configfile = require('../../config.json');
	} else if (fs.existsSync('config.example.json')) {
		__configfile = require('../../config.example.json');
	}

	var __defaultconfig = {
		'site'				: {
			'name'			: 'name',
			'name_simple'	: 'name',
			'description'	: 'description',
			'app_name'		: 'app_name'
		},
		'database'			: {
			'type'			: 'nedb',
			'host'			: '',
			'user'			: '',
			'pass'			: '',
			'port'			: -1
		},
		'gmail'				: {
			'username'		: '',
			'password'		: ''
		}
	}, __settings = __defaultconfig;

	if (__configfile) {
		var keys = Object.keys(__configfile);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[ i ];
			var val = __configfile[ key ];
			__settings[ key ] = val;
		}
	}

	exports.settings = __settings;

})( exports || this );