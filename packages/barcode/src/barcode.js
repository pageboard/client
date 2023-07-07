import bwipjs from 'bwip-js';

class HTMLElementBarcode extends Page.Element {
	static defaults = {
		bcid: null,
		text: null,
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
		} catch (e) {
			img.classList.add('error');
		}
	}
}

Page.define('element-barcode', HTMLElementBarcode);
