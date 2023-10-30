Pageboard.schemaHelpers.color = class ColorHelper {

	constructor(input, opts) {
		this.opts = opts;
		this.input = input;
		input.type = "";
		input.className = "color field";
	}

	init() {
		const input = this.input;
		input.type = "text";
		input.placeholder = this.opts.alpha ? "#000000FF" : "#000000";
		this.node = input.parentNode;
		this.node.classList.add('inline', 'color');
		this.node.addEventListener('input', this);
		this.input.before(input.dom(`
			<input type="color">
		`));
		if (this.opts.alpha) this.input.before(input.dom(`
			<input type="range" min="0" max="255" step="1">
		`));
	}

	update() {
		const rgba = this.input.value || (this.opts.alpha ? "#000000FF" : "#000000");
		const alpha = parseInt(rgba.slice(-2), 16);
		const rgb = this.opts.alpha ? rgba.slice(0, -2) : rgba;
		try {
			this.node.querySelector('[type="color"]').value = rgb;
		} catch(ex) {
			this.input.value = "";
		}
		if (this.opts.alpha) this.node.querySelector('[type="range"]').value = alpha;
	}

	handleEvent(e) {
		if (e.target == this.input) {
			this.update();
		} else {
			const color = this.node.querySelector('[type="color"]').value;
			if (this.opts.alpha) {
				const val = this.node.querySelector('[type="range"]').value;
				let alpha = parseInt(val);
				if (Number(val) != alpha) alpha = 255;
				if (alpha < 0) alpha = 0;
				else if (alpha > 255) alpha = 255;
				alpha = alpha.toString(16);
				this.input.value = (color + (alpha.length == 1 ? `0${alpha}` : alpha)).toUpperCase();
			} else {
				this.input.value = color.toUpperCase();
			}

		}
		Pageboard.trigger(this.input, 'change');
	}

	destroy() {
		this.node.removeEventListener('input', this);
		this.node.querySelector('[type="color"]')?.remove();
		this.node.querySelector('[type="range"]')?.remove();
	}

};

