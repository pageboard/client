Page.State.prototype.scroll = function(opts) {
	if (opts.once) {
		if (!this.data.$scroll.once) {
			this.data.$scroll.once = true;
		} else {
			return false;
		}
	}
	var scrollOpts = {
		top: opts.top || 0,
		left: opts.left || 0,
		behavior: opts.behavior || 'auto'
	};
	if (opts.node) {
		var rect = opts.node.getBoundingClientRect();
		scrollOpts.top = window.pageYOffset + rect.top;
		scrollOpts.left = window.pageXOffset + rect.left;
		var section = opts.node.closest('body > [block-type="main"]');
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
	var db = Pageboard.debounce(function(...args) {
		fn(...args);
	}, to);
	this.chain('close', db.clear);
	return db;
};

Page.init(function(state) {
	if (!state.data.$scroll) state.data.$scroll = {left: 0, top: 0};
});

Page.hash(function(state) {
	var hash = state.hash;
	if (!hash) return;
	var node = document.getElementById(hash);
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
	var scroll = state.data.$scroll;
	if (scroll.left || scroll.top) return;
	var ref = state.referrer;
	if (state.hash || !Page.sameDomain(ref, state) || Page.samePathname(ref, state)) {
		return;
	}
	var list = document.body.querySelectorAll(`a[href="${ref.pathname}"]`);
	var anchor = Array.from(list).filter((item) => {
		return item.closest('[block-type="nav"],nav') == null;
	}).shift();
	if (!anchor) return;
	var parent = anchor.parentNode.closest('[block-type]');
	if (!parent) return;
	state.scroll({
		node: parent
	});
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
			var a = e.target.closest('a');
			var href = a && a.getAttribute('href');
			if (!href || e.defaultPrevented || a.target) return;
			e.preventDefault();
			state.push(href);
		}
	}, document);

	if (!document.body.isContentEditable && document.body.dataset.redirect) {
		setTimeout(function() {
			state.replace(document.body.dataset.redirect);
		}, 10);
	}
});

