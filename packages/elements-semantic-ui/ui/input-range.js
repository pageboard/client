/* global noUiSlider */
class HTMLElementInputRange extends HTMLCustomElement {
	// changing only one value, connected to the minimum value
	connectedCallback() {
		this._input = this.querySelector('input');
		if (!this._input) return;
		var me = this;
		var minimum = parseFloat(this._input.getAttribute('min'));
		var start = parseFloat(this._input.value || this._input.dataset.default);
		var step = parseFloat(this._input.getAttribute('step'));
		var maximum = parseFloat(this._input.getAttribute('max'));
		noUiSlider.create(this, {
			start: [minimum, start],
			step: step,
			range: {
				min: [minimum],
				max: [maximum]
			},
			connect: true
		}).on('change', function(values) {
			var val = values[1];
			me._input.rangeFill(val);
			var e = document.createEvent('HTMLEvents');
			e.initEvent('change', true, true);
			me._input.dispatchEvent(e);
		});
		this.querySelector('.noUi-origin').setAttribute('disabled', 'true');
		this._input.rangeFill(this._input.value);
	}

	disconnectedCallback() {
		if (this.noUiSlider) this.noUiSlider.destroy();
	}
}

HTMLInputElement.prototype.rangeFill = function(val) {
	this.value = val;
	if (this.parentNode && this.parentNode.noUiSlider) this.parentNode.noUiSlider.set([null, val]);
	if (!this.required && val == this.dataset.default) this.disabled = true;
	else this.disabled = false;
};

HTMLInputElement.prototype.rangeReset = function() {
	this.rangeFill(this.dataset.default);
};


Page.setup(function() {
	HTMLCustomElement.define('element-input-range', HTMLElementInputRange);
});
