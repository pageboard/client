class HTMLScrollLinkElement extends Page.create(HTMLAnchorElement) {
	static defaults = {
		dataTo: (x) => ["home", "end"].includes(x) ? x : "end"
	};

	handleClick(e, state) {
		if (state.scope.$write) return;
		if (this.options.to == "home") {
			const main = document.querySelector('body > main') || document.body;
			main.scrollIntoView({
				block: 'start',
				behavior: 'smooth'
			});
		} else if (this.options.to == "end") {
			const main = document.querySelector('body > main:last-of-type') || document.body;
			main.scrollIntoView({
				block: 'end',
				behavior: 'smooth'
			});
		}
	}
}

Page.define(`element-scroll-link`, HTMLScrollLinkElement, 'a');
