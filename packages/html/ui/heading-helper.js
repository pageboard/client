class HTMLElementHeadingHelper extends Page.create(HTMLHeadingElement) {
	setup(state) {
		this.edited = state.debounce(() => this.sync(state.scope), 500);
	}
	sync(scope) {
		const { editor } = scope;
		if (!editor) return;
		const txt = editor.slug(this.textContent);
		const id = txt.length <= 64 ? txt : null;
		if (id != this.id) {
			editor.blocks.mutate(this, { id });
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
