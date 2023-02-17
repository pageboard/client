class HTMLElementHeadingHelper extends Page.create(HTMLHeadingElement) {
	setup(state) {
		this.willSync = state.debounce(this.sync, 100);
		this.observer = new MutationObserver(records => {
			if (records.some(mut => {
				return mut.type == "characterData" || mut.type == "childList" && mut.addedNodes.length;
			})) this.willSync();
		});
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
		const Pb = window.parent.Pageboard;
		if (!Pb.slug || !Pb.editor) return;
		const txt = Pb.slug(this.textContent);
		const id = txt.length <= 64 ? txt : null;
		if (id != this.id) {
			Pb.editor.blocks.mutate(this, { id });
		}
	}
}


for (let i = 1; i <= 6; i++) {
	Page.define(
		`h${i}-helper`,
		class extends HTMLElementHeadingHelper { },
		`h${i}`
	);
}


