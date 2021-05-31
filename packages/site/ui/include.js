class HTMLElementInclude extends VirtualHTMLElement {
	static get defaults() {
		return {
			action: null
		};
	}
	patch(state) {
		if (this._refreshing) return;
		return this.fetch(state);
	}
	render(res, state) {
		const node = Pageboard.render(res, state.scope);
		const view = this.ownView;
		view.textContent = '';
		view.appendChild(node);
	}
	hasMessage(name) {
		return this.children.find(
			node => node.matches('[block-content="messages"]')
		).querySelector('.' + name);
	}
	get ownView() {
		return this.children.find(node => node.matches('[block-content="blocks"]'));
	}
}
Page.ready(function() {
	const Cla = window.customElements.get('element-template');
	HTMLElementInclude.prototype.fetch = Cla.prototype.fetch;
	VirtualHTMLElement.define('element-include', HTMLElementInclude);
});

