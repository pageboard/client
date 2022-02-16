
class HTMLElementInclude extends VirtualHTMLElement {
	patch(state) {
		if (this.loading) return;
		return this.fetch(state);
	}
	render(res, state) {
		const node = Pageboard.render(res, state.scope);
		const view = this.ownView;
		view.textContent = '';
		view.appendChild(node);
	}
	get ownView() {
		return this.children.find(node => node.matches('[block-content="blocks"]'));
	}
}
Page.ready(() => {
	const Cla = window.customElements.get('element-template');
	HTMLElementInclude.prototype.toggleMessages = function (name) {
		const parent = this.children.find(
			node => node.matches('[block-content="messages"]')
		);
		return Cla.prototype.toggleMessages.call(this, name, parent);
	};
	HTMLElementInclude.prototype.fetch = Cla.prototype.fetch;
	HTMLElementInclude.prototype.getRedirect = Cla.prototype.getRedirect;
	VirtualHTMLElement.define('element-include', HTMLElementInclude);
});
