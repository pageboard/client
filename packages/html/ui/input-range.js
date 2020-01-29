class HTMLElementInputRange extends HTMLInputElement {
	static parse(x) {
		return (x || '').split('~').map((n) => parseFloat(n));
	}
	static get defaults() {
		return {
			min: (x) => parseFloat(x) || 0,
			max: (x) => parseFloat(x) || 100,
			value: (x) => this.parse(x),
			step: (x) => parseFloat(x) || 1,
			multiple: false
		};
	}
	get helper() {
		var node = this.nextElementSibling;
		if (!node) {
			node = this.ownerDocument.createElement('div');
			this.after(node);
		}
		return node;
	}
	get rangeValue() {
		return (this.options || {}).value;
	}
	set rangeValue(val) {
		var str = val.join('~');
		if (this.options) this.options.value = val;
		this.value = str;
	}
	rangeFill(str) {
		var val = this.rangeNorm(Object.assign({}, this.options, {
			value: this.constructor.parse(str)
		}));
		if (this.helper.noUiSlider) {
			this.helper.noUiSlider.set(val);
		}
		this.rangeValue = val;
	}
	rangeReset() {
		this.rangeFill(this.defaultValue);
	}
	patch(state) {
		if (this.helper.noUiSlider) {
			this.helper.noUiSlider.set(this.rangeNorm(this.options));
		}
	}
	rangeNorm(opts) {
		var [start, stop] = opts.value;
		if (start == null || isNaN(start)) start = opts.min;
		if (opts.multiple && (stop == null || isNaN(stop))) stop = opts.max;
		return opts.multiple ? [start, stop] : [start];
	}
	setup() {
		var opts = this.options;
		window.noUiSlider.create(this.helper, {
			start: this.rangeNorm(opts),
			step: opts.step,
			range: {
				min: opts.min,
				max: opts.max
			},
			connect: true
		}).on('change', (values) => {
			var isInt = parseInt(opts.step) == opts.step;
			this.rangeFill(values.map((n) => {
				if (isInt) n = parseInt(n);
				return n;
			}).join('~'));
			var e = document.createEvent('HTMLEvents');
			e.initEvent('change', true, true);
			this.dispatchEvent(e);
		});
	}

	close() {
		if (this.helper.noUiSlider) this.helper.noUiSlider.destroy();
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-input-range', HTMLElementInputRange, 'input');
});

