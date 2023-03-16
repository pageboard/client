Page.extend('element-embed', class HTMLElementEmbedHelper {
	paint(state) {
		if (!state.scope.$write) return;
		const { editor } = state.scope;
		if (!editor) return;
		const id = editor.slug(this.title).slice(0, 32);
		if (id != this.id) {
			editor.blocks.mutate(this, { id });
		}
	}
});
