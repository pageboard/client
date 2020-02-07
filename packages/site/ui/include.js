class HTMLElementInclude extends HTMLCustomElement {
	static get defaults() {
		return {
			action: null
		};
	}
	render(res, state) {
		delete state.scope.$element;
		var node = Pageboard.render(res, state.scope);
		var virtualContent = this.querySelector('[block-content="blocks"]');
		virtualContent.textContent = '';
		virtualContent.appendChild(node);
	}
}
Page.ready(function() {
	HTMLElementInclude.prototype.patch = window.customElements.get('element-template').prototype.patch;
	HTMLCustomElement.define('element-include', HTMLElementInclude);
});

