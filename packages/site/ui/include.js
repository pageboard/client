
class HTMLElementInclude extends Page.Element {
	init() {
		const Cla = window.customElements.get('element-template');
		this.toggleMessages = function (name) {
			const parent = this.children.find(
				node => node.matches('[block-content="messages"]')
			);
			return Cla.prototype.toggleMessages.call(this, name, parent);
		};
		this.fetch = Cla.prototype.fetch;
		this.getRedirect = Cla.prototype.getRedirect;
	}
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

Page.define('element-include', HTMLElementInclude);
