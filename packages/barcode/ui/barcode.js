class HTMLElementBarcode extends Page.Element {
	static defaults = {
		bcid: null,
		text: null,
		dimension: null,
		colorBack: '',
		colorFront: '',
		rotate: null,
		scaleX: x => parseInt(x) || 0,
		scaleY: x => parseInt(x) || 0,
		paddingWidth: x => parseInt(x) || 0,
		paddingHeight: x => parseInt(x) || 0
	};

	async patch(state) {
		this.classList.remove('error');

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
			bordercolor: this.options.colorFront,
			paddingwidth: this.options.paddingWidth,
			paddingheight: this.options.paddingHeight
		};
		const bwipFn = Pageboard.Bwip[opts.bcid.replace(/-/g, '_')];
		try {
			const svg = bwipFn(opts, Pageboard.Bwip.drawingSVG());
			this.style.width = this.options.dimension;
			const svgDoc = new DOMParser().parseFromString(svg, 'application/xml');
			this.textContent = '';
			this.appendChild(svgDoc.documentElement);
		} catch (e) {
			this.classList.add('error');
		}
	}
}

Page.define('element-barcode', HTMLElementBarcode);
