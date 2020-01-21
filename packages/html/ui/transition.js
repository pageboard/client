Object.defineProperty(document, 'body', {
	configurable: true,
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
		// transition applies scroll from documentElement to body
		var top = this.root.scrollTop;
		var left = this.root.scrollLeft;
		this.root.classList.add('transition');
		this.from.scrollTop = top;
		this.from.scrollLeft = left;
		// note that prepending new body would be nicer but there is a stacking context issue
		from.after(to);
	}
	start() {
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
					console.warn("Transition timeout from", this.from.dataset.transitionClose, "to", this.to.dataset.transitionOpen);
					this.stop();
				}, 4000);
			}
		});
	}
	stop() {
		this.ok = false;
		this.handleEvent();
	}
	scrollTo(obj) {
		this.to.scrollTop = obj.top;
		this.to.scrollLeft = obj.left;
	}
	handleEvent(e, state) {
		// only transitions of body children are considered
		if (e) {
			if (this.to.dataset.transitionOpen) {
				if (e.target != this.to) return;
			} else if (this.from.dataset.transitionClose) {
				if (e.target != this.from) return;
			} else {
				console.warn("Transition event without transition");
			}
		}
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
		var top = this.to.scrollTop;
		var left = this.to.scrollLeft;
		this.root.classList.remove('transition', 'transitioning');
		this.root.scrollTop = top;
		this.root.scrollLeft = left;
		delete this.from;
		delete this.to;
		delete this.state.transition;
		delete this.state;
		if (this.resolve) this.resolve();
	}
};


