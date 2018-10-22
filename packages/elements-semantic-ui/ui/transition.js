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
		if (!Page.state || !Page.samePath(Page.state, document.location)) return;
		Page.state.data.scroll = {
			x: window.scrollX,
			y: window.scrollY
		};
		Page.historySave('replace', Page.state);
	}, 500), false);

	if (window.history && 'scrollRestoration' in window.history) {
		window.history.scrollRestoration = 'manual';
	} else window.addEventListener('pageinit', function(e) {
		var scroll = Page.state.data.scroll;
		if (scroll) {
			setTimeout(function() {
				window.scrollTo(scroll.x, scroll.y);
			});
		}
	});

	window.addEventListener('pagepatch', function(e) {
		var scroll = e.state.data.scroll || {x: 0, y: 0};
		window.scrollTo(scroll.x, scroll.y);
	}, false);
})();

Page.updateBody = function(body, state) {
	if (!state.data.scroll) state.data.scroll = {x:0, y:0};

	var from = document.body.dataset.transitionFrom;
	var to = body.dataset.transitionTo;
	var transitionEnd = transitionEndEvent();
	state.transition = transitionEnd && (from || to) && !body.isContentEditable;

	var doc = document.documentElement;

	// First, store positions of current sections
	var fromRects = Array.prototype.map.call(document.body.children, function(node) {
		if (node.dataset.transitionKeep || !node.matches('[block-type="main"]')) return;
		return node.getBoundingClientRect();
	});

	// Second, add transition-from class to current sections
	var fromList = Array.prototype.map.call(document.body.children, function(node) {
		if (node.dataset.transitionKeep) {
			return;
		}
		node.classList.add('transition-from');
		return node;
	});

	// Third, insert new sections
	Page.updateAttributes(document.body, body);
	var clist = document.body.classList;
	clist.add('transition-before');


	var toList = Array.prototype.map.call(body.children, function(node) {
		node.classList.add('transition-to');
		return node;
	});
	toList.forEach(function(node) {
		document.body.appendChild(node);
	});

	var safeTo;

	function pageSetup(e) {
		window.removeEventListener('pagesetup', pageSetup, false);

		var scroll = e.state.data.scroll;
		if (scroll.node) {
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			scroll.node.scrollIntoView();
			scroll.x += window.scrollX - scrollX;
			scroll.y += window.scrollY - scrollY;
			delete scroll.node;
		}
		if (state.transition) {
			fromList.forEach(function(node, i) {
				var rect = fromRects[i];
				if (!node || !rect) return;
				Object.assign(node.style, {
					left: `${Math.round(rect.left + scroll.x)}px`,
					top: `${Math.round(rect.top + scroll.y)}px`,
					width: `${Math.round(rect.width)}px`,
					height: `${Math.round(rect.height)}px`
				});
			});

			doc.classList.add('transition');
			clist.add('transition');

			if (from) {
				clist.add(from);
			}
			if (to) {
				clist.add(to);
			}
		}

		clist.remove('transition-before');
		if (!state.transition) {
			cleanup();
			return;
		}

		safeTo = setTimeout(function() {
			console.warn("Transition timeout", from, to);
			trDone({target: {parentNode: document.body}});
		}, 3000);
		setTimeout(function() {
			document.documentElement.addEventListener(transitionEnd, trDone);
			clist.add('transitioning');
		});
	}

	window.addEventListener('pagesetup', pageSetup, false);

	function trDone(e) {
		if (safeTo) {
			clearTimeout(safeTo);
			safeTo = null;
		}
		// only transitions of body children are considered
		if (e.target.parentNode != document.body) return;
		document.documentElement.removeEventListener(transitionEnd, trDone);
		setTimeout(cleanup);
	}

	function cleanup() {
		fromList.forEach(function(node) {
			if (node) node.remove();
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

