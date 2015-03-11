'use strict';

(function(window, document) {

	function s() {
		for (var i = 0, components = document.querySelectorAll('[component]'); i < components.length; i++) {
			var dom = components[i];
			var c = dom.attributes.component.value;
			if (typeof app.modules[c] != 'object') {
				app.modules[c] = {};
			}
			if (typeof app.rdom[c] != 'object') {
				Object.defineProperty(app.rdom, c, {
				    value: dom, writable: true
				});
			}
			if (typeof app.vdom[c] != 'object') {
				Object.defineProperty(app.vdom, c, {
				    value: dom.cloneNode(true), writable: false
				});
			}
			if (typeof app.virtdom[c] != 'object') {
				Object.defineProperty(app.virtdom, c, {
				    value: virtualdom().serialize(dom), writable: false
				});
			}
			if (app.component[c] && typeof app.component[c] == 'object') {
				app.component[c].func.apply(this, parameters(app.component[c]));
			}
			Object.modulesync(c, app.modules[c], function(module) {
				if (app.queue[module]) {
					window.clearImmediate(app.queue[module]);
				}
				window.setImmediate(function() {
					render(app.rdom[module], app.vdom[module], app.modules[module], app.virtdom[module]);
				}, 300);
			});
			render(app.rdom[c], app.vdom[c], app.modules[c], app.virtdom[c]);
		};
	};

	function http() {
		var sid = 0, pid = 0, res = {}, queue = {}, callback = {}, limit = {}, start, terminate = false, workers = [], send = function(conf) {
			return new Promise(function(resolve, reject) {
				if (conf.before && typeof conf.before == 'function') {
					conf.before.apply(this, [conf]);
				}
				var o = webworker(function() {
					this.onmessage = function(e) {
						var ajax = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
						ajax.onload = function() {
							postMessage({
								success: true,
								type: 'html',
								status: ajax.status,
								readyState: ajax.readyState,
								responseText: ajax.responseText,
								request: e.data
							});
						}
						ajax.onerror = function() {
							postMessage({
								success: false,
								type: 'html',
								status: ajax.status,
								readyState: ajax.readyState,
								responseText: ajax.responseText,
								request: e.data
							});
						}
						if ('withCredentials' in ajax) {
							ajax.withCredentials = true;
							ajax.open(e.data.type, e.data.url + (e.data.type == 'GET' ? e.data.params : ''), true);
						} else if (typeof XDomainRequest != 'undefined') {
							ajax = new XDomainRequest();
							ajax.open(e.data.type, e.data.url);
						}
						if (~['PUT', 'DELETE', 'POST'].indexOf(e.data.type) && ajax.setRequestHeader) {
							ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
							ajax.send(e.data.params);
						} else {
							ajax.send();
						}
					}
				}).onmessage(function(e) {
					resolve({
						req: conf,
						res: e
					});
					if (conf.after && typeof conf.after == 'function') {
						conf.after.apply(this, [e]);
					}
					setImmediate(o.terminate);
				}).emit({
					url: conf.url,
					params: conf.params,
					type: conf.type
				});
				workers[workers.length] = o;
			});
		}, run = function(idx) {
			Promise.all((function() {
				for (var i = 0, t = []; i < queue[idx].length; i++) {
					t[t.length] = send(queue[idx][i]);
				}
				return t;
			})()).then(function(results) {
				if (terminate) {
					return;
				}
				res[idx] || (res[idx] = []);
				(function() {
					for (var i = 0 ; i < results.length; i++) {
						res[idx][i] = results[i];
					}
					if (callback[idx]) {
						if (limit[idx] && typeof limit[idx] == 'number') {
							res[idx].splice(limit[idx]);
						}
						Array.prototype.each = function(func) {
							if (!func) {
								return;
							}
							for (var k = 0; k < this.length; k++) {
								func.apply(this, [this[k].res ? this[k].res : this[k]]);
							}
						}
						for (var j = 0; j < callback[idx].length; j++) {
							callback[idx][j].apply(this, [res[idx], res]);
						}
					}
					if (sid > idx) {
						run(idx + 1);
					}
				})();
			});
		}, $;
		return $ = {
			params: function(d, get) {
                for (var i = 0, qs = (get ? '?' : ''), keys = Object.keys(d); i < keys.length; i++) {
                    qs += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(d[keys[i]]) + '&';
                }
                return qs.substring(0, qs.length - 1);
			},
			get: function(url, arg) {
				queue[sid] || (queue[sid] = []);
				queue[sid][(queue[sid].length)] = { url: url, params: $.params((arg ? arg.params : {}) || arg || {}, true), type: 'GET', before: (arg ? arg.before : undefined), after: (arg ? arg.after : undefined) };
				return $;
			},
			post: function(url, arg) {
				queue[sid] || (queue[sid] = []);
				queue[sid][(queue[sid].length)] = { url: url, params: $.params((arg ? arg.params : {}) || arg || {}), type: 'POST', before: (arg ? arg.before : undefined), after: (arg ? arg.after : undefined) };
				return $;
			},
			delete: function(url, arg) {
				queue[sid] || (queue[sid] = []);
				queue[sid][(queue[sid].length)] = { url: url, params: $.params((arg ? arg.params : {}) || arg  || {}), type: 'DELETE', before: (arg ? arg.before : undefined), after: (arg ? arg.after : undefined) };
				return $;
			},
			put: function(url, arg) {
				queue[sid] || (queue[sid] = []);
				queue[sid][(queue[sid].length)] = { url: url, params: $.params((arg ? arg.params : {}) || arg  || {}), type: 'PUT', before: (arg ? arg.before : undefined), after: (arg ? arg.after : undefined) };
				return $;
			},
			run: function() {
				sid++;
				if (start) {
					window.clearImmediate(start);
				}
				start = window.setImmediate(function() {
					run(pid);
				});
				return $;
			},
			then: function(func) {
				callback[sid - 1] || (callback[sid - 1] = []);
				callback[sid - 1][(callback[sid - 1].length)] = func;
				return $;
			},
			json: function() {
				callback[sid - 1] || (callback[sid - 1] = []);
				callback[sid - 1][(callback[sid - 1].length)] = function(arr) {
					for (var i = 0; i < arr.length; i++) {
						var obj = arr[i].res;
						try {
							var json = JSON.parse(obj.responseText);
							obj.responseText = json;
							obj.type = 'json';
						} catch (e) {};
					}
				}
				return $;
			},
			clear: function() {
				sid = 0, pid = 0, res = {}, queue = {}, callback = {}, limit = {};
				return $;
			},
			limit: function(num) {
				limit[sid] || (limit[sid] = num);
				return $;
			},
			terminate: function() {
				terminate = true;
				for (var i = 0; i < workers.length; i++) {
					var o = workers[i];
					o.terminate();
				}
				return $;
			},
			restore: function() {
				terminate = false;
				return $;
			}
		}
	};

	function virtualdom() {
		return {
			serialize: function(dom) {
				var ext = function(arr, el) {
					for (var i = 0; i < el.childNodes.length; i++) {
						arr[i] = vdom(el.childNodes[i]);
					}
				}
				var vdom = function(dom) {
					var obj = {
						tag: dom.localName || (dom.nodeName || '').toLowerCase(),
						attributes: (function() { for (var i = 0, atts = {}; dom.attributes && i < dom.attributes.length; i++) { atts[dom.attributes[i].name] = dom.attributes[i].value; } return atts; })(),
						class: (function() { for (var i = 0, c = []; dom.classList && i < dom.classList.length; i++) { c[i] = dom.classList[i]; } return c; })(),
						value: (dom.nodeValue ? dom.nodeValue.trim() : ''),
						id: dom.id
					};
					ext(obj.child = [], dom);
					return obj;
				}
				return vdom(dom);
			},
			deserialize: function(model) {
				var create = function(obj) {
					switch(['#text', '#comment'].indexOf(obj.tag)) {
						case 0:
							return document.createTextNode(obj.value);
							break;
						case 1:
							return document.createComment(obj.value);
							break;
						default:
							for (var i = 0, el = document.createElement(obj.tag), k = Object.keys(obj.attributes); i < k.length; i++) {
								el.setAttribute(k[i], obj.attributes[k[i]]);
							} return el;
							break;
					}
				}
				var ext = function(vdom, rdom) {
					for (var i = 0; vdom && vdom.child && i < vdom.child.length; i++) {
						rdom.appendChild(build(vdom.child[i], rdom));
					}
				}
				var build = function(vdom, rdom) {
					var rdom = create(vdom);
					ext(vdom, rdom);
					return rdom;
				}
				return build(model);
			},
			diff: function(pre, aft) {
				var diffs = [];
				var diffobj = function(a, b) {
					if (a == undefined && b == undefined) {
						return false;
					} else if (a instanceof Array && b instanceof Array) {
						for (var i = 0; i < (a.length > b.length ? a.length : b.length); i++) {
							var ro = a[i];
							var lo = b[i];
							if (ro && lo) {
								if (typeof(ro) == 'string' && typeof(lo) == 'string') {
									if (lo != ro) {
										lo = ro;
									}
								} else if (typeof(ro) == 'object' && typeof(lo) == 'object') {
									
								} else if (ro instanceof Array && lo instanceof Array) {

								}
							}
							if (ro && !lo) {

							}
							if (!ro && lo) {

							}
						}
						return false;
					} else if (typeof a == 'object' && typeof b == 'object') {
						return false;
					} else {
						return false;
					}
					return false;
				}
				var subversion = function(pre, aft, lv, n) {
					var obj = {};
					if (pre && !aft) {
						obj.type = 'remove';
						obj.row = lv;
						obj.col = n;
					} else if (!pre && aft) {
						obj.type = 'add';
						obj.row = lv;
						obj.col = n;
						obj.obj = aft;
					} else if (pre && aft) {
						for (var i = 0, r = Object.keys(aft), c = false; !c && i < r.length; i++) {
							var a = aft[r[i]], p = pre[r[i]];
							if (!c) {
								c = diffobj(p, a);
							}
							console.log(r[i], c);
						}
						console.log('--------------------------------------')
					}
				}
				var ext = function(m1, m2, lv) {
					for (var i = 0; i < (function() {
						var l1 = ((m1 ? m1.child : []) || []).length || 0;
						var l2 = ((m2 ? m2.child : []) || []).length || 0;
						return l1 > l2 ? l1 : l2;
					})(); i++) {
						var sub1 = ((m1 ? m1.child : []) || [])[i];
						var sub2 = ((m2 ? m2.child : []) || [])[i];
						compare(sub1, sub2, lv + 1, i);
					}
				}
				var compare = function(m1, m2, lv, n) {
					subversion(m1, m2, lv, n);
					ext(m1, m2, lv);
				}
				compare(pre, aft, 0, 0);
				return diffs;
			},
			patch: function(m1, m2) {

			}
		}
	}

	function webworker(func) {
    	if (!(window.URL || window.webkitURL) || !window.Blob || !window.Worker) {
    		return null;
    	}
    	var f = /function([\s]+|)\(([\w|\s]+|)\)([\s]+|)\{([\w.|\s.|\S.]+)\}(\;|)/g.exec(String(func)), worker = (function() {
    		return f.length < 5 ? null : new window.Worker((window.URL || window.webkitURL).createObjectURL(new window.Blob([f[4]])));
    	})(), $;
    	return $ = {
    		onmessage: function(func) {
    			worker.onmessage = function(e) {
    				func.apply(this, [e.data]);
    			}
    			return $;
    		},
    		emit: function(parameters) {
    			worker.postMessage(parameters);
    			return $;
    		},
    		terminate: function() {
    			return worker.terminate();
    		}
    	}
	};

	function emitter(dom) {
		return {
			on: function(name, func) {
				dom.addEventListener(name, function(evt) { func(evt.detail); });
			},
			emit: function(name, obj) {
				dom.dispatchEvent(new CustomEvent(name, { detail: obj }));
			},
			echo: function(name, func) {
				document.addEventListener(name, function(evt) { func(evt.detail); });
			},
			yell: function(name, obj) {
				document.dispatchEvent(new CustomEvent(name, { detail: obj }))
			}
		}
	};

	function sse() {
		var source = new EventSource('test.php');
	};

	function persistentstorage() {
		var supported = 'localStorage' in window && window['localStorage'] !== null && typeof(Storage) !== 'undefined';
		return {
			get: function(name) {
				return supported ? window.localStorage.getItem(name) : null;
			},
			set: function(name, value) {
				return supported ? window.localStorage.setItem(name, value) : false;
			}
		};
	};

	function sessionstorage() {
		var supported = 'sessionStorage' in window && window['sessionStorage'] !== null && typeof(Storage) !== 'undefined';
		return {
			get: function(name) {
				return supported ? window.sessionStorage.getItem(name) : null;
			},
			set: function(name, value) {
				return supported ? window.sessionStorage.setItem(name, value) : false;
			}
		}
	};

	function promise() {
		if (!window.Promise) {
			(function() {
				var asap = window.setImmediate || function(fn) { setTimeout(fn, 1); };
				var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]" };
				function bind(fn, arg) {
					return function() {
						fn.apply(arg, arguments);
					}
				}
				function Promise(fn) {
					if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
					if (typeof fn !== 'function') throw new TypeError('not a function');
					this._state = null;
					this._value = null;
					this._deferreds = [];
					doResolve(fn, bind(resolve, this), bind(reject, this));
				}
				function handle(deferred) {
					var me = this;
					if (this._state === null) {
						this._deferreds.push(deferred);
						return
					}
					asap(function() {
						var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
						if (cb === null) { (me._state ? deferred.resolve : deferred.reject)(me._value); return; }
						var ret;
						try { ret = cb(me._value); } catch (e) { deferred.reject(e); return; }
						deferred.resolve(ret);
					});
				}
				function resolve(newValue) {
					try {
						if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
						if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
							var then = newValue.then;
							if (typeof then === 'function') {
								doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
								return;
							}
						}
						this._state = true;
						this._value = newValue;
						finale.call(this);
					} catch (e) { reject.call(this, e); }
				}
				function reject(newValue) {
					this._state = false;
					this._value = newValue;
					finale.call(this);
				}
				function finale() {
					for (var i = 0, len = this._deferreds.length; i < len; i++) {
						handle.call(this, this._deferreds[i]);
					}
					this._deferreds = null;
				}
				function Handler(onFulfilled, onRejected, resolve, reject){
					this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
					this.onRejected = typeof onRejected === 'function' ? onRejected : null;
					this.resolve = resolve;
					this.reject = reject;
				}
				function doResolve(fn, onFulfilled, onRejected) {
					var done = false;
					try {
						fn(function (value) {
							if (done) return;
							done = true;
							onFulfilled(value);
						}, function (reason) {
							if (done) return;
							done = true;
							onRejected(reason);
						})
					} catch (ex) {
						if (done) return;
						done = true;
						onRejected(ex);
					}
				}
				Promise.prototype['catch'] = function (onRejected) {
					return this.then(null, onRejected);
				};
				Promise.prototype.then = function(onFulfilled, onRejected) {
					var me = this;
					return new Promise(function(resolve, reject) {
						handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
					})
				};
				Promise.all = function () {
					var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
					return new Promise(function (resolve, reject) {
						if (args.length === 0) return resolve([]);
						var remaining = args.length;
						function res(i, val) {
							try {
								if (val && (typeof val === 'object' || typeof val === 'function')) {
									var then = val.then;
									if (typeof then === 'function') {
										then.call(val, function (val) { res(i, val) }, reject);
										return;
									}
								}
								args[i] = val;
								if (--remaining === 0) { resolve(args); }
							} catch (ex) { reject(ex); }
						}
						for (var i = 0; i < args.length; i++) {
							res(i, args[i]);
						}
					});
				};
				Promise.resolve = function (value) {
					if (value && typeof value === 'object' && value.constructor === Promise) {
						return value;
					}
					return new Promise(function (resolve) {
						resolve(value);
					});
				};
				Promise.reject = function (value) {
					return new Promise(function (resolve, reject) {
						reject(value);
					});
				};
				Promise.race = function (values) {
					return new Promise(function (resolve, reject) {
						for(var i = 0, len = values.length; i < len; i++) {
							values[i].then(resolve, reject);
						}
					});
				};
			})();
		}
	};

	function observe() {
		if (!Object.observe) {
			var watch = function(obj, prop, handler) {
				var oldval = obj[prop];
				var newval = oldval;
				var getter = function() {
					return newval;
				};
				var setter = function(val) {
					oldval = newval;
					if (oldval !== val) {
						handler([{ type: 'update', object: obj, name: prop, oldValue: oldval }]);
					}
					return (newval = val);
				};
			 	if (delete obj[prop]) {
					Object.defineProperty(obj, prop, {
						get: getter, 
						set: setter, 
						enumerable: true, 
						configurable: true 
					});
				};
			};
			var update = function(delta, obj, handler) {
				var added = delta.added, deleted = delta.deleted, hasAdded = !!added.length, hasDeleted = !!deleted.length, all = delta.all, allL = all.length, response = [];
				for (var i = 0; i < allL; i++) {
					watch(obj, all[i], handler);
					if (hasAdded && i <= added.length) {
						response.push({ type: 'add', object: obj, name: added[i] });
					}
					if (hasDeleted && i <= deleted.length) {
						response.push({ type: 'deleted', object: obj, name: deleted[i] });
					}
				}
				handler(response);
			};
			var unwatch = function(obj, prop) {
				var val = obj[prop];
				delete obj[prop];
				obj[prop] = val;
			};
			var check = function(obj, time, fn) {
				Object.defineProperty(obj, '__interval__', { enumerable: false, configurable: true, writeable: false, value: setInterval(fn, time) });
			};
			var clear = function(obj) {
				clearInterval(obj.__interval__);
				delete obj.__interval__;
			};
			var compare = function(arr1, arr2) {
				if (!(arr1 instanceof Array) || !(arr2 instanceof Array)) {
					throw new TypeError('#compare accepts two parameters, both being Arrays.');
				}
				if (arr1.length !== arr2.length) {
					return false;
				}
				for (var i = 0, l = arr1.length; i < l; i++) {
					if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
						if (!compare(arr1[i], arr2[i])) {
							return false;
						}
					} else if (arr1[i] !== arr2[i]) {
						return false;
					}
				}
				return true;
			};
			var diff = function(arr1, arr2) {
				if (!arr1 || !arr2 || !(arr1 instanceof Array) || !(arr2 instanceof Array)) {
					throw new TypeError('#diff accepts two parameters, both being Arrays.');
				}
				var a = [], diff = {}, a1L = arr1.length, a2L = arr2.length;
				diff.added = [];
				diff.deleted = [];
				diff.all = [];
				for (var i = 0; i < a1L; i++) {
					a[arr1[i]] = 1;
				}
				for (var j = 0; j < a2L; j++) {
					if (a[arr2[j]]) {
						delete a[arr2[j]];
					} else {
						a[arr2[j]] = 2;
					}
				}
				for (var k in a) {
					diff.all.push(k);
					if (a[k] === 1) {
						diff.deleted.push(k);
					} else {
						diff.added.push(k);
					}
				}
				return diff;
			};
			var keys = function(obj) {
				var props = [];
				for (var prop in obj) {
					props.push(prop);
				}
				return props;
			};
			var clone = function(obj) {
				var a = [];
				for (var prop in obj) {
					a[prop] = obj[prop];
				}
				return a;
			};
			Object.defineProperty(Object.prototype, 'observe', {
	            enumerable: false,
	            configurable: true,
	            writeable: false,
	            value: function(obj, handler) {
	                var props = keys(obj), propsL = props.length;
	                for (var i = 0; i < propsL; i++) {
	                    watch(obj, props[i], handler);
	                }
	                function update() {
	                    if (!compare(props, keys(obj))) {
	                        update(diff(props, keys(obj)), obj, handler);
	                        props = keys(obj);
	                    }
	                }
	                check(obj, 50, update);
	            }
	        });
	        Object.defineProperty(Object.prototype, 'unobserve', {
	            enumerable: false,
	            configurable: true,
	            writeable: false,
	            value: function(obj) {
	                if (!obj.__interval__) {
	                    return false;
	                }
	                var props = Object.keys(obj), propsL = props.length;
	                for (var i = 0; i < propsL; i++) {
	                    unwatch(obj, props[i]);
	                }
	                clear(obj);
	            }
	        });
		}
		if (!Object.observable) {
			Object.defineProperty(Object.prototype, 'observable', {
	            enumerable: false,
	            configurable: true,
	            writeable: false,
	            value: function(obj, handler) {
	                Object.observe(obj, function(changes) {
	                	for (var i = 0; i < changes.length; i++) {
	                		var change = changes[i];
	                		if (change.type == 'add') {
	                			if (obj[change.name] instanceof Array) {
	                				Object.observable(obj[change.name], handler);
	                			} else if (typeof obj[change.name] == 'object') {
 	                				Object.observable(obj[change.name], handler);
	                			}
	                		}
	                	}
	                	handler.apply(this, arguments);
	                });
	                for (var i = 0, n = Object.keys(obj); i < n.length; i++) {
	                	var o = obj[n[i]];
	                	if (o instanceof Array) {
		                	Object.observable(o, handler);
	                	} else if (typeof o == 'object') {
		                	Object.observable(o, handler);
	                	}
	                }
	            }
	        });
		}
		if (!Object.modulesync) {
			Object.defineProperty(Object.prototype, 'modulesync', {
	            enumerable: false,
	            configurable: true,
	            writeable: false,
	            value: function(name, obj, handler) {
	            	Object.observable(obj, function(changes) {
	            		handler.apply(this, [name, changes]);
	            	});
	            }
	        });
		}
	};

	function immediate() {
		if (!window.setImmediate) {
			(function() {
				var nextHandle = 1, tasksByHandle = {}, currentlyRunningATask = false, doc = window.document, setImmediate;
			    function addFromSetImmediateArguments(args) {
			        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
			        return nextHandle++;
			    }
			    function partiallyApplied(handler) {
			        var args = [].slice.call(arguments, 1);
			        return function() { if (typeof handler === 'function') { handler.apply(undefined, args); } else { (new Function('' + handler))(); } };
			    }
			    function runIfPresent(handle) {
			        if (currentlyRunningATask) {
			            setTimeout(partiallyApplied(runIfPresent, handle), 0);
			        } else {
			            var task = tasksByHandle[handle];
			            if (task) {
			                currentlyRunningATask = true;
			                try { task(); } finally { clearImmediate(handle); currentlyRunningATask = false; }
			            }
			        }
			    }
			    function clearImmediate(handle) {
			        delete tasksByHandle[handle];
			    }
			    function installNextTickImplementation() {
			        setImmediate = function() {
			            var handle = addFromSetImmediateArguments(arguments);
			            process.nextTick(partiallyApplied(runIfPresent, handle));
			            return handle;
			        };
			    }
			    function canUsePostMessage() {
			        if (window.postMessage && !window.importScripts) {
			            var postMessageIsAsynchronous = true;
			            var oldOnMessage = window.onmessage;
			            window.onmessage = function() {
			                postMessageIsAsynchronous = false;
			            };
			            window.postMessage('', '*');
			            window.onmessage = oldOnMessage;
			            return postMessageIsAsynchronous;
			        }
			    }
			    function installPostMessageImplementation() {
			    	var messagePrefix = 'setImmediate$' + Math.random() + '$';
			        var onwindowMessage = function(event) {
			            if (event.source === window &&
			                typeof event.data === 'string' &&
			                event.data.indexOf(messagePrefix) === 0) {
			                runIfPresent(+event.data.slice(messagePrefix.length));
			            }
			        };
			        if (window.addEventListener) {
			            window.addEventListener('message', onwindowMessage, false);
			        } else {
			            window.attachEvent('onmessage', onwindowMessage);
			        }
			        setImmediate = function() {
			            var handle = addFromSetImmediateArguments(arguments);
			            window.postMessage(messagePrefix + handle, '*');
			            return handle;
			        };
			    }
			    function installMessageChannelImplementation() {
			        var channel = new MessageChannel();
			        channel.port1.onmessage = function(event) {
			            var handle = event.data;
			            runIfPresent(handle);
			        };
			        setImmediate = function() {
			            var handle = addFromSetImmediateArguments(arguments);
			            channel.port2.postMessage(handle);
			            return handle;
			        };
			    }
			    function installReadyStateChangeImplementation() {
			        var html = doc.documentElement;
			        setImmediate = function() {
			            var handle = addFromSetImmediateArguments(arguments);
			            var script = doc.createElement('script');
			            script.onreadystatechange = function () {
			                runIfPresent(handle);
			                script.onreadystatechange = null;
			                html.removeChild(script);
			                script = null;
			            };
			            html.appendChild(script);
			            return handle;
			        };
			    }
			    function installSetTimeoutImplementation() {
			        setImmediate = function() {
			            var handle = addFromSetImmediateArguments(arguments);
			            setTimeout(partiallyApplied(runIfPresent, handle), 0);
			            return handle;
			        };
			    }
    			if ({}.toString.call(window.process) === '[object process]') {
			        installNextTickImplementation();
			    } else if (canUsePostMessage()) {
			        installPostMessageImplementation();
			    } else if (window.MessageChannel) {
			        installMessageChannelImplementation();
			    } else if (doc && 'onreadystatechange' in doc.createElement('script')) {
			        installReadyStateChangeImplementation();
			    } else {
			        installSetTimeoutImplementation();
			    }
			    Window.prototype.setImmediate = setImmediate;
			    Window.prototype.clearImmediate = clearImmediate;
			})();
		}
	}

	function render(dom, vdom, module, virtdom) {
		var tmp = vdom.cloneNode(true);
		var _nodes = tmp.childNodes;
		var nodes = dom.childNodes;
		for (var j = 0; j < _nodes.length; j++) {
			var _node = _nodes[j];
			var node = nodes[j];
			var content = _node.textContent.trim();
			for (var r = content.match(/\{\{([\w.|\s.|\'\"\[\]]+|)\}\}/g), i = 0; r != null && i < r.length; i++) {
				var ref = r[i].substr(2, r[i].length - 4).split('|')[0].trim();
				var val = (function() {
					for (var k = 0, g = ref.match(/(\[(\'|\"|)([\w.\s.]+)(\'|\"|)\]|(\.[\w|\s]+))/g), p = ref, d = []; g != null && k < g.length; k++) {
						var m = /(\[(\'|\"|)([\w.\s.]+)(\'|\"|)\]|(\.[\w|\s]+))/g.exec(g[k]);
						d[k] = m[0].substr(0, 1) == '.' ? m[0].substr(1, m[0].length) : m[3];
						p = p.replace(g[k], '');
					}
					for (var l = 0, o = module[p]; l < d.length; l++) {
						o = o[d[l]];
					}
					return o;
				})();
				var filter = (function() {
					var f = r[i].substr(2, r[i].length - 4).split('|')[1];
					return f && typeof f == 'string' ? f.trim() : null;
				}());
				if (val != undefined) {
					node.textContent = _node.textContent.replace(/\{\{([\w.|\s.|\'\"\[\]]+|)\}\}/g, (filter && app.filter[filter] && app.filter[filter].func) ? (function() {
						return app.filter[filter].func.apply(this, parameters(app.filter[filter]))(val);
					})() : val);
				}
			}
		};
		bind(dom, module);
	};

	function bind(dom, module) {
		for (var i = 0, eventDoms = dom.querySelectorAll('[sync]'), cont = dom.attributes.component.value; i < eventDoms.length; i++) {
			var el = eventDoms[i];
			var ref = el.attributes.sync.value;
			var val = (function() {
				for (var k = 0, g = ref.match(/(\[(\'|\"|)([\w.\s.]+)(\'|\"|)\]|(\.[\w|\s]+))/g), p = ref, d = []; g != null && k < g.length; k++) {
					var m = /(\[(\'|\"|)([\w.\s.]+)(\'|\"|)\]|(\.[\w|\s]+))/g.exec(g[k]);
					d[k] = m[0].substr(0, 1) == '.' ? m[0].substr(1, m[0].length) : m[3];
					p = p.replace(g[k], '');
				}
				for (var l = 0, o = module[p]; l < d.length; l++) {
					o = o[d[l]];
				}
				return o;
			})();
			if (el.value != val) {
				if (el.type && ~['text', 'password', 'search'].indexOf(el.type)) {
					var start = el.selectionStart, end = el.selectionEnd;
					el.value = val;
					if (el == document.activeElement) {
						el.setSelectionRange(start, end);
					}
				}
			}
			listener(el);
		};
	};

	function listener(dom) {
		if (!~app.event.indexOf(dom)) {
			dom.addEventListener('input', onchange, false);
			dom.addEventListener('change', onchange, false);
			app.event.push(dom);
		};
	};

	function onchange(evt) {
		var el = this;
		var ref = el.attributes.sync.value;
		var val = el.value;
		var c = function() {
			var parent = el.parentNode;
			while (!parent.attributes.component) {
				parent = parent.parentNode;
			};
			return parent.attributes.component.value;
		}();
		(function() {
			for (var i = 0, v = ref.split('.'), d = app.modules[c]; i < v.length - 1; i++) {
				d = d[v[i]];
			}
			d[v[v.length - 1]] = val;
		})();
		// render(app.rdom[c], app.vdom[c], app.modules[c], app.virtdom[c]);
	};

	function parameters(obj) {
		return obj.libs && obj.libs.length > 0 ? (function() {
			var x = [];
			for (var i = 0; i < obj.libs.length; i++) {
				var ref = obj.libs[i];
				if (ref == 'root') {
					x[i] = app.store;
				} else if (ref == 'module') {
					x[i] = app.modules[obj.name] || (app.modules[obj.name] = {});
				} else if (ref == 'http') {
					x[i] = http();
				} else if (ref == 'emitter') {
					x[i] = emitter(app.rdom[obj.name]);
				} else if (ref == 'webworker') {
					x[i] = webworker;
				} else if (ref == 'persistentstorage') {
					x[i] = persistentstorage();
				} else if (ref == 'sessionstorage') {
					x[i] = sessionstorage();
				} else {
					if (app.registry[ref]) {
						x[i] = app.registry[ref].interface;
					} else {
						x[i] = null;
					}
				}
			}
			if (!~x.indexOf(app.modules[obj.name])) {
				x[x.length] = app.modules[obj.name] || (app.modules[obj.name] = {});
			}
			return x;
		})() : [app.modules[obj.name] || (app.modules[obj.name] = {})];
	};

	function args() {
		var name, func, query;
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == 'string') {
				name = arguments[i];
			} else if (typeof arguments[i] == 'function') {
				func = arguments[i];
			} else if (arguments[i] instanceof Array) {
				query = arguments[i];
			}
		}
		if (name && (func || query)) {
			if (query && query instanceof Array) {
				var libs = [], func;
				for (var i = 0; i < query.length; i++) {
					if (typeof query[i] == 'string') {
						libs.push(query[i]);
					} else if (typeof query[i] == 'function') {
						func = query[i];
					}
				}
				return { name: name, libs: libs, func: func };
			} else if (func && typeof func == 'function') {
				return { name: name, func: func };
			}
		}
		return undefined;
	};

	promise();
	observe();
	immediate();

	var app = { event: [], vdom: {}, rdom: {}, virtdom: {}, registry: {}, store: {}, queue: {}, modules: {}, component: {}, filter: {}, directive: {}, $: {} };

	app.$.name = 'storyair-js';
	app.$.version = '1.0.0a';

	window.onload = s;

	app.$.component = function() {
		var obj = args.apply(this, arguments);
		app.component[obj.name] = obj;
		return app.$;
	};

	app.$.filter = function() {
		var obj = args.apply(this, arguments);
		app.filter[obj.name] = obj;
		return app.$;
	};

	app.$.service = function() {
		var obj = args.apply(this, arguments);
		var func = obj.func.apply(this, parameters(obj));
		if (func.interface && !app.registry[obj.name]) {
			if (typeof func.interface != 'object') {
				console.error('interface type must be an object.');
			} else {
				app.registry[obj.name] = func;
				if (func.ready) {
					func.ready.apply(this);
				}
			}
		}
		return app.$;
	};

	app.$.directive = function() {

	};

	app.$.route = function() {

	};

	app.$.view = function() {

	};

	app.$.html = function() {

	};

	app.$.extend = function() {

	};

	return window.Storyair = window.storyair = window.s = app.$;

}(window, document));
