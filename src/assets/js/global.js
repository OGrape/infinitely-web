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

;(function(window) {

	window.storyair.component('header', ['module', function(module) {

		var offset = 50,
			onscroll = function(event) {
				var name = document.body.scrollTop < offset ? 'nav-visible' : 'nav-hidden';
				if (document.body.className != name) {
					document.body.className = name;
				}
			};

		window.onscroll = onscroll;
		onscroll();

	}]);

})(window || this);