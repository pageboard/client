class HTMLElementInputUrl extends Page.create(HTMLInputElement) {
	async presubmit(state) {
		const field = this.closest('.field');
		field.classList.remove('success', 'error');
		if (!this.value) return;
		field.classList.add('loading');
		try {
			const res = await state.fetch('post', "/.api/href", { url: this.value });
			const acceptList = this.getAttribute('accept')?.split(',') ?? [];
			const href = res.item;
			if (!acceptList.includes(href.type)) throw new Error("Unacceptable url type");
		} catch (err) {
			field.classList.add('error');
			throw err;
		} finally {
			field.classList.remove('loading');
		}
	}
}

Page.define('element-input-url', HTMLElementInputUrl, 'input');

