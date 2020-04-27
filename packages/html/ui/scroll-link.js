class HTMLScrollLinkElement extends HTMLAnchorElement {
	static get defaults() {
		return {
			dataTo: (x) => ["home", "end"].includes(x) ? x : "end"
		};
	}
	handleClick(e, state) {
		if (this.isContentEditable) return;
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

Page.setup(function(state) {
	HTMLCustomElement.define(`element-scroll-link`, HTMLScrollLinkElement, 'a');
});

