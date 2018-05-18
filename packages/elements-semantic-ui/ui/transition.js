(function() {
	var list = ['init', 'route', 'build', 'patch', 'setup', 'close', 'error'];
	var tokens = document.documentElement.classList;
	var idTimeout;
	function pageListener(e) {
		if (!Page.state) return;
		if (idTimeout) {
			clearTimeout(idTimeout);
			idTimeout = null;
		}
		var cur = e.type.substring(4);
		tokens.add(cur);
		list.forEach(function(name) {
			if (name != cur) tokens.remove(name);
		});
		var timeout = 0;
		if (cur == "setup" || cur == "patch") timeout = 400;
		if (cur == "error") timeout = 3000;
		if (timeout) {
			idTimeout = setTimeout(function() {
				idTimeout = null;
				tokens.remove(cur);
			}, timeout);
		}
	}
	list.forEach(function(name) {
		window.addEventListener(`page${name}`, pageListener);
	});
})();

Page.setup(function(state) {
	document.body.addEventListener('click', function(e) {
		var a = e.target.closest('a');
		var href = a && a.getAttribute('href');
		if (href) {
			if (document.body.isContentEditable) {
				e.preventDefault();
				return;
			}
			if (a.target) {
				return;
			} else {
				e.preventDefault();
				Page.push(href);
			}
		}
	}, false);

	Page.updateBody = function(body) {
		var from = document.body.dataset.transitionFrom;
		var to = body.dataset.transitionTo;
		var transitionEnd = transitionEndEvent();
		if (!transitionEnd || !from && !to) {
			return body;
		}
		var doc = document.documentElement;

		var fromCoords = Array.prototype.map.call(document.body.children, function(node) {
			if (node.matches('[block-type="main"]')) return {
				top: `${node.offsetTop}px`,
				left: `${node.offsetLeft}px`,
				width: `${node.offsetWidth}px`,
				height: `${node.offsetHeight}px`
			};
		});

		Page.updateAttributes(document.body, body);
		var clist = document.body.classList;
		clist.add('transition');
		doc.classList.add('transition');
		if (to) {
			to = to + "-to";
			clist.add(to);
		}
		if (from) {
			from = from + "-from";
			clist.add(from);
		}
		var fromList = Array.prototype.map.call(document.body.children, function(node, i) {
			if (fromCoords[i]) {
				Object.assign(node.style, fromCoords[i]);
			}
			node.classList.add('transition-from');
			return node;
		});
		var toList = Array.prototype.map.call(body.children, function(node) {
			node.classList.add('transition-to');
			return node;
		});
		toList.forEach(function(node) {
			document.body.appendChild(node);
		});
		setTimeout(function() {
			clist.add('transitioning');
		});
		document.documentElement.addEventListener(transitionEnd, trDone);

		function trDone(e) {
			// only transitions of body children are considered
			if (e.target.parentNode != document.body) return;
			document.documentElement.removeEventListener(transitionEnd, trDone);
			fromList.forEach(function(node) {
				node.remove();
			});
			toList.forEach(function(node) {
				node.classList.remove('transition-to');
			});
			clist.remove('transition', 'transitioning');
			doc.classList.remove('transition');
			if (from) clist.remove(from);
			if (to) clist.remove(to);
		}
	};

	function transitionEndEvent() {
		var transitions = {
			transition: "transitionend",
			OTransition: 'oTransitionEnd',
			MozTransition: "transitionend",
			msTransition: 'MSTransitionEnd',
			WebkitTransition: 'webkitTransitionEnd'
		};

		var st = document.body.style;
		for (var t in transitions) {
			if (st[t] !== undefined) {
				return transitions[t];
			}
		}
	}
	if (!document.body.isContentEditable && document.body.dataset.redirect) {
		setTimeout(function() {
			Page.replace(document.body.dataset.redirect);
		}, 10);
	}
});

