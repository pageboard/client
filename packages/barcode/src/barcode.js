import JsBarcode from 'jsbarcode';

class HTMLElementBarcode extends Page.Element {
	static defaults = {
		format: null,
		text: null,
		dimension: null,
		colorBack: '',
		colorFront: '',
		ratio: x => parseInt(x) || 0,
		padding: x => parseInt(x) || 0
	};

	async patch(state) {
		this.classList.remove('error');
		const { options } = this;
		try {
			this.style.width = options.dimension;
			const svgDoc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'application/xml');
			JsBarcode(svgDoc.documentElement, options.text, {
				xmlDocument: svgDoc,
				margin: options.padding,
				format: options.format,
				background: options.colorBack,
				lineColor: options.colorFront,
				height: options.ratio * 2
			});
			this.textContent = '';
			this.appendChild(svgDoc.documentElement);
		} catch (err) {
			console.error(err);
			this.classList.add('error');
		}
	}
}

Page.define('element-barcode', HTMLElementBarcode);
