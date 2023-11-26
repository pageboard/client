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
	if (this.stage == "fragment" && (!this.referrer || this.samePathname(this.referrer))) {
		scrollOpts.behavior = 'smooth';
	}
	if (opts.node) {
		opts.node.scrollIntoView({
			behavior: scrollOpts.behavior
		});
	} else if (this.scope.transition) {
		this.scope.transition.scrollTo(scrollOpts);
	} else {
		window.scrollTo(scrollOpts);
	}
};

const statePush = Page.constructor.prototype.push;
Page.constructor.prototype.push = function (loc, opts) {
	this.scope.transition?.cancel();
	if (typeof loc == "string") loc = this.parse(loc);
	if (loc.pathname) {
		const { $lang } = this.scope;
		const suffix = `~${$lang}`;
		const suffixed = this.pathname.endsWith(suffix);
		if (suffixed && !/~\w{2}$/.test(loc.pathname)) {
			loc.pathname += suffix;
		}
	}
	return statePush.call(this, loc, opts);
};

Page.connect(new class {
	#x;
	#y;
	#fragScroll = false;

	patch(state) {
		state.finish(() => {
			const { $lang } = state.scope;
			const suffixed = state.pathname.endsWith(`~${$lang}`);
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
					if (suffixed || a.hreflang) {
						const bare = loc.pathname.slice(0, -ext.length || undefined);
						if (!/~\w{2}$/.test(bare)) {
							a.pathname = `${bare}~${a.hreflang || $lang}${ext}`;
						}
					}
				}
			}
		});
	}
	fragment(state) {
		const { hash, targetNode } = state;
		if (targetNode) targetNode.classList.remove('pseudo-target');
		if (!hash) return;
		const node = document.getElementById(hash.slice(1));
		if (!node) return;
		this.#fragScroll = true;
		window.requestAnimationFrame(() => {
			node.classList.add('pseudo-target');
			state.targetNode = node;
			const root = document.documentElement;
			const { scrollLeft, scrollTop } = root;
			node.scrollIntoView({ behavior: 'instant' });
			this.#x = root.scrollLeft;
			this.#y = root.scrollTop;
			Object.assign(root, { scrollLeft, scrollTop });
			state.scroll({ node });
		});
	}

	paint(state) {
		const root = document.documentElement;
		const header = root.querySelector('body > header');
		root.style.setProperty('--page-header-height',
			header ? window.getComputedStyle(header).height : '0px'
		);
		if (!state.data.scroll) state.data.scroll = {
			left: root.scrollLeft,
			top: root.scrollTop
		};
		if (window.history && 'scrollRestoration' in window.history) {
			window.history.scrollRestoration = 'manual';
			if (!state.hash) state.scroll(state.data.scroll);
		}
	}

	handleAllScroll(e, state) {
		if (state.scope.transition) return;
		const root = document.documentElement;
		const x = root.scrollLeft;
		const y = root.scrollTop;
		state.data.scroll = { left: x, top: y };

		if (this.#fragScroll) {
			if (x == this.#x && y == this.#y) {
				this.#fragScroll = false;
			}
			e.stopImmediatePropagation();
		}
		if (!state.willSave) {
			state.willSave = state.debounce(() => state.save(), 300);
		}
		state.willSave();
	}

	handleAllClick(e, state) {
		const a = e.target.closest('a');
		const href = a?.getAttribute('href');
		if (!href || e.defaultPrevented || a.target) return;
		e.preventDefault();
		state.push(href);
	}
});
