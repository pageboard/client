class HTMLElementMailImage extends Page.create(HTMLImageElement) {
	static defaults = {
		dataSrc: null,
		dataCrop: null,
		dataWidth: x => parseInt(x) || 0,
		dataHeight: x => parseInt(x) || 0,
	};

	get image() {
		return this;
	}
	patch(state) {
		const img = this.image;
		if (!this.options.src) {
			this.src = "data:image/svg+xml," + encodeURIComponent(
				`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 320 240"><text text-anchor="middle" dominant-baseline="central" x="50%" y="50%" fill="#aaa">∅</text></svg>`);
			return;
		}

		const meta = state.scope.$hrefs?.[this.options.src];
		if (meta) {
			this.dataset.width = meta.width;
			this.dataset.height = meta.height;
			this.dataset.mime = meta.mime;
		} else {
			console.warn("Missing href", this.options.src);
		}

		const srcLoc = Page.parse(this.options.src);
		if (this.dataset.mime == "image/svg+xml") srcLoc.query.format = 'png';

		// const wide = 580;
		// if (w > wide) {
		// 	wz = Math.ceil(100 * wide / w);
		// }
		img.setAttribute('src', srcLoc.toString());
	}
}

Page.define(`element-mail-img`, HTMLElementMailImage, 'img');
