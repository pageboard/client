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
		var node = Pageboard.render(res, state.scope);
		var virtualContent = this.querySelector('[block-content="blocks"]');
		virtualContent.textContent = '';
		virtualContent.appendChild(node);
	}
}
Page.ready(function() {
	const Cla = window.customElements.get('element-template');
	HTMLElementInclude.prototype.fetch = Cla.prototype.fetch;
	VirtualHTMLElement.define('element-include', HTMLElementInclude);
});

