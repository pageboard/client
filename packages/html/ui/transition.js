Object.defineProperty(document, 'body', {
	get: function() {
		return this.documentElement.querySelector('body:last-of-type');
	}
});
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

Page.State.prototype.mergeBody = function(body, corpse) {
	if (this.referrer.transition) this.referrer.transition.stop();
	if (body.isContentEditable || body.getAttribute('block-type') != corpse.getAttribute('block-type')) {
		corpse.replaceWith(body);
	} else {
		this.transition = new Page.Transition(this, body, corpse);
	}
};

Page.setup(function(state) {
	if (state.transition) {
		if (state.transition.ok) state.finish(function() {
			return state.transition.start();
		});
		else state.transition.cleanup();
	}
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
	constructor(state, to, from) {
		this.state = state;
		this.from = from;
		this.to = to;
		this.root = from.parentNode;
		this.event = this.constructor.event('end');
		this.ok = this.event
			&& (from.dataset.transitionClose || to.dataset.transitionOpen);

		var fromLeft = from.scrollLeft;
		var fromTop = from.scrollTop;
		this.root.classList.add('transition');

		from.style.left = fromLeft;
		from.style.top = fromTop;
		window.scrollTo(0, 0);
		// note that prepending new body would be nicer but there is a stacking context issue
		from.after(to);
	}
	start() {
		var scroll = this.state.data.$scroll;
		if (this.node) {
			/*
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			this.node.scrollIntoView(); // this.state.scroll({node: this.node}) ?
			scroll.left += window.scrollX - scrollX;
			scroll.top += window.scrollY - scrollY;
			*/
			delete this.node;
		}
		//window.scrollTo(scroll);

		return new Promise((resolve) => {
			this.resolve = resolve;
			if (!this.ok) {
				this.cleanup();
			} else {
				setTimeout(() => {
					this.root.addEventListener(this.event, this);
					this.root.classList.add('transitioning');
				});
				this.safe = setTimeout(() => {
					console.warn("Transition timeout");
					this.stop();
				}, 3000);
			}
		});
	}
	stop() {
		this.ok = false;
		this.handleEvent();
	}
	handleEvent(e, state) {
		// only transitions of body children are considered
		if (e && e.target != this.to) return;
		if (this.safe) {
			clearTimeout(this.safe);
			delete this.safe;
		}
		this.root.removeEventListener(this.event, this);
		if (e) setTimeout(() => this.cleanup());
		else this.cleanup();
	}
	cleanup() {
		this.from.remove();
		this.root.classList.remove('transition', 'transitioning');
		delete this.from;
		delete this.to;
		delete this.state.transition;
		delete this.state;
		if (this.resolve) this.resolve();
	}
};


