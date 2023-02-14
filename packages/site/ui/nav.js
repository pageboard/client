Page.constructor.prototype.scroll = function(opts) {
	if (opts.once) {
		if (!this.scope.$scroll.once) {
			this.scope.$scroll.once = true;
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
	if (this.stage == "focus" && this.samePathname(this.referrer) && this.referrer.scope.$scroll) {
		scrollOpts.behavior = 'smooth';
	}
	if (this.scope.transition) this.scope.transition.scrollTo(scrollOpts);
	else window.scrollTo(scrollOpts);
};

Page.constructor.prototype.debounce = function(fn, to) {
	const db = Pageboard.debounce((...args) => {
		fn(...args);
	}, to);
	this.chain('close', db.clear);
	return db;
};

Page.init(state => {
	if (!state.scope.$scroll) state.scope.$scroll = {left: 0, top: 0};
});

Page.patch(state => {
	state.finish(() => {
		for (const a of document.querySelectorAll('a[href]')) {
			const loc = state.parse(a.href);
			if (loc.hostname && loc.hostname != document.location.hostname) {
				a.target = "_blank";
				a.rel = "noopener";
			} else if (loc.pathname && (loc.pathname.startsWith('/.') || /\.\w+$/.test(loc.pathname))) {
				a.target = "_blank";
			} else {
				const [href] = a.href.split('?');
				const meta = state.scope.$hrefs?.[href];
				if (meta?.mime && meta.mime.startsWith("text/html")) {
					a.target = "_blank";
				}
			}
		}
	});
});

Page.focus(state => {
	const { hash } = state;
	if (!hash) return;
	const node = document.getElementById(hash);
	if (!node) return;
	state.scroll({node: node});
});

Page.setup(state => {
	if (window.history && 'scrollRestoration' in window.history) {
		window.history.scrollRestoration = 'manual';
		if (!state.hash) state.scroll(state.scope.$scroll);
	}
	state.connect({
		handleScroll: state.debounce((e, state) => {
			if (state.scope.transition) return;
			state.scope.$scroll = {
				left: window.scrollX,
				top: window.scrollY
			};
			state.save();
		}, 500)
	}, window);
	state.connect({
		handleClick: (e, state) => {
			const a = e.target.closest('a');
			const href = a?.getAttribute('href');
			if (!href || e.defaultPrevented || a.target) return;
			e.preventDefault();
			state.push(href);
		}
	}, document);
});

const statePush = Page.constructor.prototype.push;
Page.constructor.prototype.push = function (...args) {
	if (this.scope.transition) this.scope.transition.cancel();
	return statePush.apply(this, args);
};
