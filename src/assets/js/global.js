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

	WebFont.load({
		classes: false,
		events: false,
		typekit: {
			id: 'rhk3rvc'
		}
	});

	var offset = 50,
		onscroll = function(event) {
			var name = document.body.scrollTop < offset ? 'nav-visible' : 'nav-hidden';
			if (document.body.className != name) {
				document.body.className = name;
			}
		};

	window.onscroll = onscroll;
	onscroll();

	var Contact = {};

	Contact.controller = function() {
		this.name = '';
		this.email = '';
		this.message = '';
		this.result = '';
	}

	Contact.controller.prototype.capitalize = function(str) {
		return str.toLowerCase().replace( /\b\w/g, function (s) {
			return s.toUpperCase();
		});
	};

	Contact.view = function(controller) {
		return [
			m('form', {
				onsubmit: function(e) {
					e.preventDefault();
					controller.result = '';
					if (typeof controller.name == 'string' && !controller.name.trim()) {
						controller.result = 'Don’t forget to include your name';
					} else if (typeof controller.email == 'string' && !controller.email.trim()) {
						controller.result = 'I’ll need your email to reply back';
					} else if (typeof controller.email == 'string' && !(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/.test(controller.email))) {
						controller.result = 'Did you mistype your email by accident?';
					} else if (typeof controller.message == 'string' && !controller.message.trim()) {
						controller.result = 'Haha I thought you are gonna tell me something';
					} else {
						m.request({
							url		: '/shoot',
							method	: 'POST',
							data	: {
								name	: controller.name,
								email	: controller.email,
								message	: controller.message
							}
						}).then(function(res) {
							if (res && res.success === true) {
								controller.result = 'Hey ' + controller.name + '! I got your email. I will get back to you soon.';
								controller.name = '';
								controller.email = '';
								controller.message = '';
							} else if (res && res.success === false && res.error) {
								controller.result = res.error;
							} 
						})
					}
				}
			}, [
				controller.result
				? m('li', [
					m('div.notification', controller.result)
				])
				: undefined,
				m('li.col-2', [
					m('input.site.site-section.section-contact-input[name="name"][placeholder="Your Name"][type="text"]', {
						spellcheck: false,
						autocomplete: 'off',
						value: controller.name,
						oninput: function() {
							controller.name = controller.capitalize(this.value);
						}
					})
				]),
				m('li.col-2', [
					m('input.site.site-section.section-contact-input[name="email"][placeholder="Email Address"][type="text"]', {
						spellcheck: false,
						autocomplete: 'off',
						value: controller.email,
						oninput: function() {
							controller.email = this.value;
						}
					})
				]),
				m('li.clear'),
				m('li', [
					m('textarea.site.site-section.section-contact-textarea[name="message"][placeholder="Write me something yeah!"]', {
						spellcheck: false,
						autocomplete: 'off',
						oninput: function() {
							controller.message = this.value;
						}
					}, controller.message)
				]),
				m('li', [
					m('input.site.site-section.section-contact-button[name="submit"][type="submit"][value="Ready? Shoot!"]')
				])
			])
		]
	}

	m.module(document.querySelector('#section-home-contact ul'), Contact);

})(window || this);