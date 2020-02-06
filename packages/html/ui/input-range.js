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
			multiple: true,
			pips: true,
		};
	}
	get helper() {
		var node = this.parentNode.querySelector('.noUi-target');
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
		var str = val.join('~');
		if (this.options) this.options.value = val;
		this.value = str;
	}
	rangeFill(str) {
		var val = this.rangeNorm(Object.assign(this.options, {
			value: this.constructor.parse(str)
		}));
		this.updateSlider(val);
		this.rangeValue = str == null ? [] : val;
	}
	rangeReset() {
		this.rangeFill(this.defaultValue);
	}
	updateSlider(val) {
		var helper = this.helper;
		if (helper.noUiSlider) {
			helper.noUiSlider.set(val);
			helper.classList.toggle('indeterminate', this.options.value == null || isNaN(this.options.value[0]));
		}
	}
	patch(state) {
		this.updateSlider(this.rangeNorm(this.options));
	}
	rangeNorm(opts) {
		var [start, stop] = opts.value;
		var vals = [isNaN(start) ? opts.min : start];
		if (opts.multiple) {
			vals.push(isNaN(stop) ? opts.max : stop);
		}
		return vals;
	}
	setup(state) {
		var opts = this.options;
		var helper = this.helper;
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
			var isInt = parseInt(opts.step) == opts.step;
			helper.classList.remove('indeterminate');
			this.rangeFill(values.map((n) => {
				if (isInt) n = parseInt(n);
				return n;
			}).join('~'));
			var e = document.createEvent('HTMLEvents');
			e.initEvent('change', true, true);
			this.dispatchEvent(e);
		});
		helper.addEventListener('keydown', this, true);
		this.patch(state);
	}
	handleEvent(e) {
		if (e.keyCode == 8 || e.keyCode == 46) {
			this.rangeFill();
			var e = document.createEvent('HTMLEvents');
			e.initEvent('change', true, true);
			this.dispatchEvent(e);
		}
	}

	close() {
		var helper = this.helper;
		if (helper.noUiSlider) helper.noUiSlider.destroy();
		helper.removeEventListener('keydown', this, true);
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-input-range', HTMLElementInputRange, 'input');
});

