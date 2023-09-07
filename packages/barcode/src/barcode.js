import bwipjs from 'bwip-js';

class HTMLElementBarcode extends Page.Element {
	static defaults = {
		bcid: null,
		text: null,
		dimension: null,
		scaleX: x => parseInt(x) || 0,
		scaleY: x => parseInt(x) || 0
	};

	async patch(state) {
		const doc = this.ownerDocument;
		const canvas = doc.createElement('canvas');
		const img = this.querySelector('img') || this.appendChild(doc.createElement('img'));
		img.classList.remove('error');
		try {
			bwipjs.toCanvas(Object.assign({
				includetext: true
			}, this.options), canvas);
			img.src = canvas.toDataURL('image/png');
			const dim = parseFloat(this.options.dimension);
			if (Number.isNaN(dim)) {
				delete img.width;
				delete img.height;
			} else {
				const unit = /([a-z]+)$/.exec(this.options.dimension)?.[1] ?? 'px';
				img.width = this.options.scaleX * (dim < 1 ? 1 : dim) + unit;
				img.height = this.options.scaleY * (dim < 1 ? 1 : dim) + unit;
			}
		} catch (e) {
			img.classList.add('error');
		}
	}
}

Page.define('element-barcode', HTMLElementBarcode);
