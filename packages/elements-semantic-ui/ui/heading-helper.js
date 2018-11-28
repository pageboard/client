class HTMLElementHeadingHelper extends HTMLHeadingElement {
	init() {
		this.observer = new MutationObserver(function(mutations) {
			if (mutations.some(function(mut) {
				return mut.type == "characterData";
			}))	this.updateChildren();
		}.bind(this));
	}
	connectedCallback() {
		this.observer.observe(this, {
			childList: true,
			subtree: true,
			characterData: true
		});
	}
	disconnectedCallback() {
		this.observer.disconnect();
	}
	updateChildren() {
		var Pb = window.parent.Pageboard;
		if (!Pb || !Pb.slug) return;
		var id = Pb.slug(this.textContent);
		if (id && id != this.id) {
			var block = Pb.editor.blocks.get(this.getAttribute('block-id'));
			block.data.id = id;
			var tr = Pb.editor.state.tr;
			Pb.editor.utils.refreshTr(tr, this, block);
			Pb.editor.dispatch(tr);
		}
	}
}

Page.setup(function() {
	for (var i=1; i <= 6; i++) {
		HTMLCustomElement.define(`h${i}-helper`, class extends HTMLElementHeadingHelper {}, `h${i}`);
	}
});
