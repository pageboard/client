Pageboard.schemaHelpers.color = class ColorHelper {

	constructor(input, opts) {
		this.opts = opts;
		this.input = input;
		input.type = "";
		input.className = "color field";
	}

	init() {
		const input = this.input;
		input.parentNode.classList.add('inline');
		this.node = input.dom(`
			<div class="inline color fields">
				<input type="color">
				<input type="range" min="0" max="255" step="1">
			</div>
		`);
		this.node.addEventListener('input', this);
		this.input.after(this.node);
	}

	update() {
		const rgba = this.input.value || '#000000FF';
		const alpha = parseInt(rgba.slice(-2), 16);
		const rgb = rgba.slice(0, -2);
		try {
			this.node.querySelector('[type="color"]').value = rgb;
		} catch(ex) {
			this.input.value = "";
		}
		this.node.querySelector('[type="range"]').value = alpha;
	}

	handleEvent(e) {
		const color = this.node.querySelector('[type="color"]').value;
		const val = this.node.querySelector('[type="range"]').value;
		let alpha = parseInt(val);
		if (Number(val) != alpha) alpha = 255;
		if (alpha < 0) alpha = 0;
		else if (alpha > 255) alpha = 255;
		alpha = alpha.toString(16);
		this.input.value = color + (alpha.length == 1 ? `0${alpha}` : alpha);
		Pageboard.trigger(this.input, 'change');
	}

	destroy() {
		this.node?.removeEventListener('input', this);
		this.node?.remove();
	}

};

