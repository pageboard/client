import { qrcode, ean13, upca, isbn } from 'bwip-js';
const bwip = { qrcode, ean13, upca, isbn };

class HTMLElementBarcode extends Page.Element {
	static defaults = {
		bcid: null,
		text: null,
		dimension: null,
		colorBack: null,
		colorFront: null,
		rotate: null,
		scaleX: x => parseInt(x) || 0,
		scaleY: x => parseInt(x) || 0
	};

	async patch(state) {
		const doc = this.ownerDocument;
		const canvas = doc.createElement('canvas');
		const img = this.querySelector('img') || this.appendChild(doc.createElement('img'));
		img.classList.remove('error');
		img.width = this.options.scaleX;
		img.height = this.options.scaleY;
		img.style.height = this.options.dimension;
		const opts = {
			bcid: this.options.bcid,
			includetext: true,
			scaleX: this.options.scaleX,
			scaleY: this.options.scaleY,
			rotate: this.options.rotate,
			backgroundColor: this.options.colorBack,
			textColor: this.options.colorFront,
			barColor: this.options.colorFront,
			borderColor: this.options.colorFront
		};
		const bwipFn = bwip[opts.bcid.replace(/-/g, '_')];
		try {
			bwipFn(canvas, opts);
			img.src = canvas.toDataURL('image/png');
		} catch (e) {
			img.classList.add('error');
		}
	}
}

Page.define('element-barcode', HTMLElementBarcode);
