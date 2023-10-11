Page.constructor.prototype.scroll = function(opts) {
	if (opts.once) {
		if (!this.data.scroll.once) {
			this.data.scroll.once = true;
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
	if (this.stage == "fragment" && (!this.referrer || this.samePathname(this.referrer))) {
		scrollOpts.behavior = 'smooth';
	}
	if (this.scope.transition) this.scope.transition.scrollTo(scrollOpts);
	else window.scrollTo(scrollOpts);
};

Page.ready(state => {
	if (!state.data.scroll) state.data.scroll = {
		left: window.scrollX,
		top: window.scrollY
	};
});

Page.patch(state => {
	state.finish(() => {
		const { $lang } = state.scope;
		const suffix = (str => state.pathname.endsWith(str) ? str : '')('~' + $lang);
		for (const a of document.querySelectorAll('a[href]')) {
			const loc = state.parse(a.href);
			if (loc.hostname && loc.hostname != document.location.hostname) {
				a.target = "_blank";
				a.rel = "noopener";
			} else if (/^\.\w+\//.test(loc.pathname)) {
				a.target = "_blank";
			} else {
				const ext = /\.\w{3,4}$/.exec(loc.pathname)?.[0] ?? '';
				if (ext) a.target = "_blank";
				if (suffix) {
					const bare = loc.pathname.slice(0, -ext.length || undefined);
					if (!/~\w{2}$/.test(bare)) {
						a.pathname = bare + suffix + ext;
					}
				}
			}
		}
	});
});

Page.fragment(state => {
	const { hash } = state;
	if (!hash) return;
	const node = document.getElementById(hash.slice(1));
	if (!node) return;
	state.scroll({ node });
});

Page.paint(state => {
	if (window.history && 'scrollRestoration' in window.history) {
		window.history.scrollRestoration = 'manual';
		if (!state.hash) state.scroll(state.data.scroll);
	}
});

Page.setup(state => {
	state.connect({
		handleScroll: state.debounce((e, state) => {
			if (state.scope.transition) return;
			state.data.scroll = {
				left: window.scrollX,
				top: window.scrollY
			};
			state.save();
		}, 250)
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
Page.constructor.prototype.push = function (loc, opts) {
	this.scope.transition?.cancel();
	if (typeof loc == "string") loc = this.parse(loc);
	if (loc.pathname) {
		const { $lang } = this.scope;
		const suffix = (str => this.pathname.endsWith(str) ? str : '')('~' + $lang);
		if (suffix && !/~\w{2}$/.test(loc.pathname)) {
			loc.pathname += suffix;
		}
	}
	return statePush.call(this, loc, opts);
};
