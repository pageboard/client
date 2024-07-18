class HTMLElementInputUrl extends Page.create(HTMLInputElement) {
	async presubmit(state) {
		const field = this.closest('.field');
		field.classList.remove('success', 'error');
		if (!this.value) return;
		field.classList.add('loading');
		try {
			const { href } = await state.fetch('post', "/@api/href/add", { url: this.value });
			const acceptList = this.getAttribute('accept')?.split(',') ?? [];
			if (!acceptList.includes(href.type)) {
				const err = new Error(`Unacceptable url type: ${href.type}`);
				err.status = 400;
				err.statusText = err.message;
			}
		} catch (err) {
			field.classList.add('error');
			throw err;
		} finally {
			field.classList.remove('loading');
		}
	}
}

Page.define('element-input-url', HTMLElementInputUrl, 'input');

