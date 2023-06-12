class HTMLElementInputRange extends Page.create(HTMLInputElement) {
	static parse(x) {
		return (x == null ? '' : x)
			.split('⩽')
			.map(n => {
				n = parseFloat(n);
				return Number.isNaN(n) ? null : n;
			});
	}
	static defaults = {
		min: (x) => parseFloat(x) || 0,
		max: (x) => parseFloat(x) || 100,
		value: (x) => this.parse(x),
		step: (x) => parseFloat(x) || 1,
		multiple: false,
		pips: false
	};

	get helper() {
		if (!this.parentNode) return null;
		let node = this.parentNode.querySelector('.noUi-target');
		if (!node) {
			node = this.ownerDocument.createElement('div');
			node.className = "noUi-target";
			this.after(node);
		}
		return node;
	}
	get rangeValue() {
		return this.options?.value;
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
	convertOptions(opts) {
		return {
			step: Math.max(opts.step ?? 10, Math.round((opts.max - opts.min) / 10)),
			range: {
				min: opts.min ?? 0,
				max: opts.max ?? 100
			},
			pips: opts.pips ? {
				mode: 'steps',
				density: 100
			} : false,
		};
	}
	updateSlider() {
		const helper = this.helper;
		const slider = helper?.noUiSlider;
		if (!slider) return;
		const opts = this.options;
		let [start, stop] = opts.value || [];
		let indet = false;
		if (start == null) {
			start = opts.min;
			if (stop == null) stop = opts.max;
			indet = true;
		}
		if (stop == null) stop = start;

		slider.set([start, stop]);
		slider.updateOptions(this.convertOptions(opts));
		helper.classList.toggle('indeterminate', indet);
	}
	patch(state) {
		this.updateSlider();
	}
	setup(state) {
		const opts = this.options;
		const helper = this.helper;
		if (!helper) return;
		if (!helper.noUiSlider) window.noUiSlider.create(helper, Object.assign({
			start: opts.multiple ? [null, null] : [null],
			connect: true
		}, this.convertOptions(opts))).on('change', (values) => {
			if (state.scope.$write) return;
			const isInt = parseInt(opts.step) == opts.step;
			helper.classList.remove('indeterminate');
			if (isInt) values = values.map(n => parseInt(n));
			this.rangeValue = values;
			state.dispatch(this, 'change');
		});
		helper.addEventListener('keydown', this, true);
		helper.addEventListener('dblclick', this, true);
		this.patch(state);
	}
	handleEvent(e, state) {
		if (state.scope.$write) return;
		if (e.type == "dblclick" || e.keyCode == 8 || e.keyCode == 46) {
			this.fill();
			state.dispatch(this, 'change');
		}
	}

	close() {
		const helper = this.helper;
		if (!helper) return;
		if (helper.noUiSlider) helper.noUiSlider.destroy();
		helper.removeEventListener('keydown', this, true);
		helper.removeEventListener('dblclick', this, true);
	}
}


Page.define('element-input-range', HTMLElementInputRange, 'input');


