import QRCode from 'qrcode';

class HTMLElementQRCode extends Page.Element {
	static defaults = {
		text: null,
		dimension: null,
		colorBack: '',
		colorFront: '',
		scale: x => parseInt(x) || 0,
		padding: x => parseInt(x) || 0
	};

	async patch(state) {
		this.classList.remove('error');
		const { options } = this;
		try {
			this.style.width = options.dimension;

			const p = QRCode.toString(options.text, {
				type: 'svg',
				margin: options.padding,
				scale: options.scale,
				color: {
					dark: options.colorFront,
					light: options.colorBack
				}
			});
			const svg = await p;
			this.innerHTML = '<img src="data:image/svg+xml,[svg|enc:url]" />';
			this.fuse({ svg }, state.scope);
		} catch (err) {
			console.error(err);
			this.classList.add('error');
		}
	}
}

Page.define('element-qrcode', HTMLElementQRCode);
