
class HTMLElementInclude extends Page.Element {
	fetch(...args) {
		return window.HTMLElementTemplate.prototype.fetch.apply(this, args);
	}
	getRedirect(...args) {
		return window.HTMLElementTemplate.prototype.getRedirect.apply(this, args);
	}
	toggleMessages(name) {
		const parent = this.children.find(
			node => node.matches('[block-content="messages"]')
		);
		return window.HTMLElementTemplate.prototype.toggleMessages.call(this, name, parent);
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
