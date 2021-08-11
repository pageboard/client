Page.State.prototype.scroll = function(opts) {
	if (opts.once) {
		if (!this.data.$scroll.once) {
			this.data.$scroll.once = true;
		} else {
			return false;
		}
	}
	const scrollOpts = {
		top: opts.top || 0,
		left: opts.left || 0,
		behavior: opts.behavior || 'auto'
	};
	if (opts.node) {
		const rect = opts.node.getBoundingClientRect();
		scrollOpts.top = window.pageYOffset + rect.top;
		scrollOpts.left = window.pageXOffset + rect.left;
		let section = opts.node.closest('body > [block-type="main"]');
		if (section) {
			while ((section = section.previousElementSibling)) {
				if (["static", "relative"].includes(window.getComputedStyle(section).position) == false) {
					scrollOpts.top -= section.getBoundingClientRect().height;
				}
			}
		} else {
			return;
		}
	}
	if (this.stage == "hash" && Page.samePathname(this, this.referrer) && this.referrer.data.$scroll) {
		scrollOpts.behavior = 'smooth';
	}
	if (this.transition) this.transition.scrollTo(scrollOpts);
	else window.scrollTo(scrollOpts);
};

Page.State.prototype.debounce = function(fn, to) {
	const db = Pageboard.debounce(function(...args) {
		fn(...args);
	}, to);
	this.chain('close', db.clear);
	return db;
};

Page.init(function(state) {
	if (!state.data.$scroll) state.data.$scroll = {left: 0, top: 0};
});

Page.hash(function(state) {
	const hash = state.hash;
	if (!hash) return;
	const node = document.getElementById(hash);
	if (!node) return;
	state.scroll({node: node});
});

Page.setup(function(state) {
	if (window.history && 'scrollRestoration' in window.history) {
		window.history.scrollRestoration = 'manual';
		if (!state.hash) state.scroll(state.data.$scroll);
	}
});

Page.setup(function(state) {
	Page.connect({
		handleScroll: state.debounce(function(e, state) {
			if (state.transition) return;
			state.data.$scroll = {
				left: window.scrollX,
				top: window.scrollY
			};
			state.save();
		}, 500)
	}, window);
});

Page.setup(function navigate(state) {
	Page.connect({
		handleClick: (e, state) => {
			const a = e.target.closest('a');
			const href = a?.getAttribute('href');
			if (!href || e.defaultPrevented || a.target) return;
			e.preventDefault();
			state.push(href);
		}
	}, document);
});

const statePush = Page.State.prototype.push;
Page.State.prototype.push = function (...args) {
	if (this.transition) this.transition.cancel();
	return statePush.apply(this, args);
};
