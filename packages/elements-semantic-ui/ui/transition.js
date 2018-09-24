(function() {
	var list = ['init', 'route', 'build', 'patch', 'setup', 'close', 'error'];
	var tokens = document.documentElement.classList;
	var idTimeout;
	function pageListener(e) {
		if (!Page.state) return; // we don't want progress bar on first load
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
		if (cur == "error") {
			timeout = 3000;
			var err = e.state && e.state.error;
			if (typeof err == "number" && err >= 500) {
				// document.location.reload() is not always in sync with state
				document.location = Page.format(e.state);
			}
		}
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
	window.addEventListener('scroll', Pageboard.debounce(function(e) {
		if (Page.format(Page.state) != Page.format(document.location.toString())) {
			return;
		}
		Page.state.data.scroll = {
			x: window.scrollX,
			y: window.scrollY
		};
		Page.historySave('replace', Page.state);
	}, 500), false);

	window.addEventListener('pageinit', function(e) {
		var scroll = Page.state.data.scroll;
		if (scroll) {
			setTimeout(function() {
				window.scrollTo(scroll.x, scroll.y);
			});
		}
	});
})();

Page.updateDone = function(state) {
	var scroll = state.data.scroll || {x: 0, y: 0};
	window.scrollTo(scroll.x, scroll.y);
};

Page.updateBody = function(body, state) {
	if (!state.data.scroll) state.data.scroll = {x:0, y:0};

	var from = document.body.dataset.transitionFrom;
	var to = body.dataset.transitionTo;
	var transitionEnd = transitionEndEvent();
	if (!transitionEnd || !from && !to) {
		return body;
	}

	var doc = document.documentElement;

	var fromCoords = Array.prototype.map.call(document.body.children, function(node) {
		if (!node.matches('[block-type="main"]')) return;
		return {
			top: `${node.offsetTop - window.scrollY + state.data.scroll.y}px`,
			left: `${node.offsetLeft - window.scrollX + state.data.scroll.x}px`,
			width: `${node.offsetWidth}px`,
			height: `${node.offsetHeight}px`
		};
	});

	Page.updateAttributes(document.body, body);
	var clist = document.body.classList;
	clist.add('transition');
	doc.classList.add('transition');
	if (to) {
		clist.add(to);
	}
	if (from) {
		clist.add(from);
	}
	var fromList = [];
	Array.prototype.forEach.call(document.body.children, function(node, i) {
		if (node.dataset.transitionKeep) return;
		if (fromCoords[i]) {
			Object.assign(node.style, fromCoords[i]);
		}
		node.classList.add('transition-from');
		fromList.push(node);
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
	var safeTo = setTimeout(function() {
		trDone({target: {parentNode: document.body}});
	}, 3000);

	function trDone(e) {
		if (safeTo) {
			clearTimeout(safeTo);
			safeTo = null;
		}
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
};

Page.setup(function(state) {
	document.body.addEventListener('click', function(e) {
		var a = e.target.closest('a');
		var href = a && a.getAttribute('href');
		if (href) {
			if (e.defaultPrevented) return;
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

	if (!document.body.isContentEditable && document.body.dataset.redirect) {
		setTimeout(function() {
			Page.replace(document.body.dataset.redirect);
		}, 10);
	}
});

