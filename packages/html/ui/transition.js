Object.defineProperty(document, 'body', {
	configurable: true,
	get: function() {
		return this.documentElement.querySelector('body:last-of-type');
	}
});

const loader = new class {
	ready(state) {
		this.update(state.stage);
	}
	patch(state) {
		this.update(state);
	}
	paint(state) {
		this.update(state);
		const cur = document.documentElement;
		setTimeout(() => cur.removeAttribute('data-stage'), 700);
	}
	catch(state) {
		this.update(state);
	}
	update(state) {
		document.documentElement.dataset.stage = state.stage;
	}
	setup(state) {
		document.body.hidden = true;
		const tr = state.scope.transition;
		state.finish(() => {
			document.body.hidden = false;
			if (tr?.ok) return tr.start();
		});
		tr?.end();
	}
};
Page.connect(loader);
loader.update(Page);

class Transition {
	#defer;

	static event(name) {
		const low = name.toLowerCase();
		const caps = name[0].toUpperCase() + low.substring(1);
		const transitions = {
			transition: "transition" + low,
			OTransition: 'oTransition' + caps,
			MozTransition: "transition" + low,
			msTransition: 'MSTransition' + caps,
			WebkitTransition: 'webkitTransition' + caps
		};

		const st = document.body.style;
		for (const [t, v] of Object.entries(transitions)) {
			if (st[t] !== undefined) {
				return v;
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
		const top = this.root.scrollTop;
		const left = this.root.scrollLeft;
		this.root.classList.add('transition');
		this.from.scrollTop = top;
		this.from.scrollLeft = left;
		// note that prepending new body would be nicer but there is a stacking context issue
		from.after(to);
	}
	start() {
		this.#defer = new Deferred();
		if (!this.ok) {
			this.destroy();
		} else {
			setTimeout(() => {
				this.root.addEventListener(this.event, this);
				this.root.classList.add('transitioning');
			});
			this.safe = setTimeout(() => {
				console.warn("Transition timeout");
				this.end();
			}, 4000);
		}
	}
	cancel() {
		this.ok = false;
		this.root.classList.remove('transitioning');
		if (this.#defer) {
			this.#defer.resolve();
			this.#defer = null;
		}
	}
	end() {
		this.ok = false;
		this.from.remove();
		this.destroy();
		if (this.#defer) {
			this.#defer.resolve();
			this.#defer = null;
		}
	}
	scrollTo(obj) {
		this.to.scrollTop = obj.top;
		this.to.scrollLeft = obj.left;
	}
	handleEvent(e, state) {
		// only transitions of body children are considered
		if (!this.to || !this.from) {
			return;
		}
		if (this.to.dataset.transitionOpen) {
			if (e.target != this.to) return;
		} else if (this.from.dataset.transitionClose) {
			if (e.target != this.from) return;
		} else {
			console.warn("Transition event without transition");
		}

		this.end();
	}
	destroy() {
		this.root.removeEventListener(this.event, this);
		if (this.safe) {
			clearTimeout(this.safe);
			delete this.safe;
		}
		const top = this.to.scrollTop;
		const left = this.to.scrollLeft;
		this.root.classList.remove('transition', 'transitioning');
		this.root.scrollTop = top;
		this.root.scrollLeft = left;
		delete this.from;
		delete this.to;
		delete this.state.scope.transition;
		delete this.state;
	}
}

Page.constructor.prototype.mergeBody = function (body, corpse) {
	if (this.referrer.scope.transition) {
		this.referrer.scope.transition.end();
	}
	if (this.scope.$write || body.getAttribute('block-type') != corpse.getAttribute('block-type')) {
		corpse.replaceWith(body);
	} else {
		this.scope.transition = new Transition(this, body, corpse);
	}
};
