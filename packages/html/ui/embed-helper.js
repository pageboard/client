Page.extend('element-embed', class HTMLElementEmbedHelper {
	patch(state) {
		const { editor } = state.scope;
		if (!editor) return;
		const id = editor.slug(this.title).slice(0, 32);
		if (id != this.id) {
			editor.blocks.mutate(this, { id });
		}
	}
});
