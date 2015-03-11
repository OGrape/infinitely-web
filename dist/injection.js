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

 ;(function(exports, global) {

 	global.settings = require( __dirname + '/__settings/config' ).settings;
 	global.database = require( __dirname + '/__database/' + settings.database.type );

 	global.template = require( __dirname + '/template' );

 	global.variables = require( __dirname + '/variables');

 	variables.template = template;

 }) ( exports || this, global || this );