class HTMLElementHeadingHelper extends HTMLHeadingElement {
	init() {
		this.observer = new MutationObserver((records) => {
			if (records.some((mut) => {
				return mut.type == "characterData" || mut.type == "childList" && mut.addedNodes.length;
			}))	this.sync();
		});
	}
	setup() {
		this.observer.observe(this, {
			childList: true,
			subtree: true,
			characterData: true
		});
	}
	close() {
		if (this.observer) this.observer.disconnect();
	}
	sync() {
		var Pb = window.parent.Pageboard;
		if (!Pb.slug || !Pb.editor) return;
		var id = Pb.slug(this.textContent);
		if (id && id != this.id) {
			Pb.editor.blocks.mutate(this, {
				id: id
			});
		}
	}
}

Page.setup(function() {
	for (var i=1; i <= 6; i++) {
		HTMLCustomElement.define(`h${i}-helper`, class extends HTMLElementHeadingHelper {}, `h${i}`);
	}
});
