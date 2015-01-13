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

(function( module, exports ) {

	var fs = require('fs'),
		__varsfile;

	if (fs.existsSync('vars.json')) {
		__varsfile = require('../vars.json');
	} else if (fs.existsSync('vars.example.json')) {
		__varsfile = require('../vars.example.json');
	}

	var vars = {
		'site_name'						: settings.site.name,
		'site_name_simple'				: settings.site.name_simple,
		'site_description'				: settings.site.description,
		'site_app_name'					: settings.site.app_name
	}

	if (__varsfile) {
		var keys = Object.keys(__varsfile);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[ i ];
			var val = __varsfile[ key ];
			vars[ key ] = val;
		}
	}

	exports = module.exports = vars;

})( module, exports || this );