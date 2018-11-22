Page.init(function(state) {
	var root = document.documentElement;
	function dtr(state) {
		root.dataset.stage = state.stage;
		if (state.stage == "setup" || state.stage == "patch") setTimeout(function() {
			root.removeAttribute('data-stage');
		}, 500);
	}
	dtr(state);
	Page.ready(dtr);
	Page.patch(dtr);
	Page.setup(dtr);
	Page.error(dtr);
});

Page.init(function(state) {
	state.mergeBody = function(body, corpse) {
		if (this.referrer.transition) this.referrer.transition.stop();
		this.transition = new Page.Transition(this, body, corpse);
	};
});

Page.hash(function(state) {
	var hash = state.hash;
	if (!hash) return;
	var node = document.getElementById(hash);
	if (!node) return;
	if (node.scrollIntoView) node.scrollIntoView();
});

Page.setup(function restoreScrollReferrer(state) {
	var scroll = state.data.scroll;
	if (scroll && (scroll.x || scroll.y)) return;
	var ref = state.referrer;
	if (!Page.sameDomain(ref, state) || Page.samePathname(ref, state)) {
		return;
	}
	var anc = document.querySelector(`a[href="${ref.pathname}"]:not(.item):not([block-type="nav"])`);
	if (!anc) return;
	var parent = anc.parentNode.closest('[block-id]');
	if (!parent) return;
	if (!state.transition || !state.transition.ok) {
		if (parent.scrollIntoView) parent.scrollIntoView();
	} else {
		state.transition.node = parent;
	}
});

Page.setup(function(state) {
	if (state.transition) state.finish(function() {
		return state.transition.start();
	});
});

Page.Transition = class {
	static event(name) {
		var low = name.toLowerCase();
		var caps = name[0].toUpperCase() + low.substring(1);
		var transitions = {
			transition: "transition" + low,
			OTransition: 'oTransition' + caps,
			MozTransition: "transition" + low,
			msTransition: 'MSTransition' + caps,
			WebkitTransition: 'webkitTransition' + caps
		};

		var st = document.body.style;
		for (var t in transitions) {
			if (st[t] !== undefined) {
				return transitions[t];
			}
		}
	}
	constructor(state, body, corpse) {
		this.state = state;
		this.body = corpse;

		if (!state.data.scroll) state.data.scroll = {x:0, y:0};

		this.from = corpse.dataset.transitionFrom;
		this.to = body.dataset.transitionTo;

		// First, store positions of current sections
		this.rects = Array.prototype.map.call(corpse.children, function(node) {
			if (node.dataset.transitionKeep || !node.matches('[block-type="main"]')) return;
			return node.getBoundingClientRect();
		});

		// Second, add transition-from class to current sections
		this.fromList = Array.prototype.map.call(corpse.children, function(node) {
			if (node.dataset.transitionKeep) {
				return;
			}
			node.classList.add('transition-from');
			return node;
		});

		// Third, insert new sections
		state.updateAttributes(corpse, body);
		corpse.classList.add('transition-before');

		this.toList = Array.prototype.map.call(body.children, function(node) {
			node.classList.add('transition-to');
			return node;
		});
		this.toList.forEach(function(node) {
			corpse.appendChild(node);
		});
		this.event = this.constructor.event('end');
		if (this.event && (this.from || this.to) && !body.isContentEditable && this.fromList.length > 0 && this.toList.length > 0) this.ok = true;
	}
	start() {
		var clist = this.body.classList;
		var scroll = this.state.data.scroll;
		if (this.node) {
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			this.node.scrollIntoView();
			scroll.x += window.scrollX - scrollX;
			scroll.y += window.scrollY - scrollY;
			delete this.node;
		}
		if (this.ok) {
			this.fromList.forEach(function(node, i) {
				var rect = this.rects[i];
				if (!node || !rect) return;
				Object.assign(node.style, {
					left: `${Math.round(rect.left + scroll.x)}px`,
					top: `${Math.round(rect.top + scroll.y)}px`,
					width: `${Math.round(rect.width)}px`,
					height: `${Math.round(rect.height)}px`
				});
			}, this);

			this.body.parentNode.classList.add('transition');
			clist.add('transition');

			if (this.from) {
				clist.add(this.from);
			}
			if (this.to) {
				clist.add(this.to);
			}
		}
		window.scrollTo(scroll.x, scroll.y);

		clist.remove('transition-before');

		var it = this;

		return new Promise(function(resolve) {
			it.resolve = resolve;
			if (!it.ok) {
				it.cleanup();
			} else {
				setTimeout(function() {
					it.body.parentNode.addEventListener(it.event, it);
					clist.add('transitioning');
				});
				it.safeTo = setTimeout(function() {
					console.warn("Transition timeout", it.from, it.to);
					it.stop();
				}, 3000);
			}
		});
	}
	stop(immediate) {
		this.ok = false;
		this.handleEvent();
	}
	handleEvent(e) {
		if (this.safeTo) {
			clearTimeout(this.safeTo);
			delete this.safeTo;
		}
		// only transitions of body children are considered
		if (e && e.target.parentNode != this.body) return;
		this.body.parentNode.removeEventListener(this.event, this);
		if (e) setTimeout(this.cleanup.bind(this));
		else this.cleanup();
	}
	cleanup() {
		this.fromList.forEach(function(node) {
			if (node) node.remove();
		});
		this.toList.forEach(function(node) {
			node.classList.remove('transition-to');
		});
		var clist = this.body.classList;
		clist.remove('transition', 'transitioning');
		this.body.parentNode.classList.remove('transition');
		if (this.from) clist.remove(this.from);
		if (this.to) clist.remove(this.to);
		delete this.body;
		delete this.state.transition;
		delete this.state;
		this.resolve();
	}
};

Page.setup(function navigate(state) {
	document.addEventListener('click', function(e) {
		var a = e.target.closest('a');
		var href = a && a.getAttribute('href');
		if (!href) return;
		if (!e.defaultPrevented) {
			if (!document.body.isContentEditable && a.target) return;
			e.preventDefault();
		}
		state.push(href);
	}, false);

	if (!document.body.isContentEditable && document.body.dataset.redirect) {
		setTimeout(function() {
			state.replace(document.body.dataset.redirect);
		}, 10);
	}
});

Page.setup(function(state) {
	// Page removes event listener automatically
	window.addEventListener('scroll', Pageboard.debounce(function(e) {
		state.data.scroll = {
			x: window.scrollX,
			y: window.scrollY
		};
		state.save();
	}, 500), false);
});

Page.init(function(state) {
	if (window.history && 'scrollRestoration' in window.history) {
		window.history.scrollRestoration = 'manual';
	} else {
		var scroll = state.referrer && state.referrer.data.scroll; // need "old" state
		if (scroll) {
			setTimeout(function() {
				window.scrollTo(scroll.x, scroll.y);
			});
		}
	}
});
