class HTMLElementBarcode extends Page.Element {
	static defaults = {
		bcid: null,
		text: null,
		dimension: null,
		colorBack: '',
		colorFront: '',
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
			text: this.options.text,
			bcid: this.options.bcid,
			includetext: true,
			scaleX: this.options.scaleX,
			scaleY: this.options.scaleY,
			rotate: this.options.rotate,
			backgroundcolor: this.options.colorBack,
			textcolor: this.options.colorFront,
			barcolor: this.options.colorFront,
			bordercolor: this.options.colorFront
		};
		const bwipFn = Pageboard.Bwip[opts.bcid.replace(/-/g, '_')];
		try {
			bwipFn(canvas, opts);
			img.src = canvas.toDataURL('image/png');
		} catch (e) {
			img.classList.add('error');
		}
	}
}

Page.define('element-barcode', HTMLElementBarcode);
