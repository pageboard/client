class HTMLElementInputRange extends HTMLInputElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static parse(x) {
		return (x == null ? '' : x)
			.split('⩽')
			.map((n) => {
				n = parseFloat(n);
				return Number.isNaN(n) ? null : n;
			});
	}
	static defaults = {
		min: (x) => parseFloat(x) || 0,
		max: (x) => parseFloat(x) || 100,
		value: (x) => this.parse(x),
		step: (x) => parseFloat(x) || 1,
		multiple: true,
		pips: true,
	};

	get helper() {
		let node = this.parentNode.querySelector('.noUi-target');
		if (!node) {
			node = this.ownerDocument.createElement('div');
			node.className = "noUi-target";
			this.after(node);
		}
		return node;
	}
	get rangeValue() {
		return (this.options || {}).value;
	}
	set rangeValue(val) {
		if (this.options) this.options.value = val;
		let str = '';
		if (val.length) str = val[0];
		if (val.length == 2 && val[1] !== val[0]) str += '⩽' + val[1];
		this.value = str;
	}
	fill(str) {
		this.rangeValue = this.constructor.parse(str);
		this.updateSlider();
	}
	updateSlider() {
		const helper = this.helper;
		if (!helper.noUiSlider) return;
		let [start, stop] = this.options.value || [];
		let indet = false;
		if (start == null) {
			start = this.options.min;
			if (stop == null) stop = this.options.max;
			indet = true;
		}
		if (stop == null) stop = start;

		helper.noUiSlider.set([start, stop]);
		helper.classList.toggle('indeterminate', indet);
	}
	patch(state) {
		this.updateSlider();
	}
	setup(state) {
		const opts = this.options;
		const helper = this.helper;
		if (!helper.noUiSlider) window.noUiSlider.create(helper, {
			start: opts.multiple ? [null, null] : [null],
			step: opts.step,
			range: {
				min: opts.min,
				max: opts.max
			},
			pips: opts.pips ? {
				mode: 'steps',
				density: 100
			} : false,
			connect: true
		}).on('change', (values) => {
			const isInt = parseInt(opts.step) == opts.step;
			helper.classList.remove('indeterminate');
			if (isInt) values = values.map((n) => parseInt(n));
			this.rangeValue = values;
			const e = document.createEvent('HTMLEvents');
			e.initEvent('change', true, true);
			this.dispatchEvent(e);
		});
		helper.addEventListener('keydown', this, true);
		helper.addEventListener('dblclick', this, true);
		this.patch(state);
	}
	handleEvent(e) {
		if (e.type == "dblclick" || e.keyCode == 8 || e.keyCode == 46) {
			this.fill();
			const ne = document.createEvent('HTMLEvents');
			ne.initEvent('change', true, true);
			this.dispatchEvent(ne);
		}
	}

	close() {
		const helper = this.helper;
		if (helper.noUiSlider) helper.noUiSlider.destroy();
		helper.removeEventListener('keydown', this, true);
		helper.removeEventListener('dblclick', this, true);
	}
}

Page.ready(function() {
	VirtualHTMLElement.define('element-input-range', HTMLElementInputRange, 'input');
});

