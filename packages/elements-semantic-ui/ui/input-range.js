class HTMLElementInputRange extends HTMLCustomElement {
	connectedCallback() {
		this._input = this.querySelector('input');
		if (!this._input) return;
		var me = this;
		rangeSlider.create(this._input, {
			onSlideEnd: function(val) {
				me._input.rangeFill(val);
				var e = document.createEvent('HTMLEvents');
				e.initEvent('change', true, true);
				me._input.dispatchEvent(e);
			}
		});
		this._input.rangeFill(this._input.value);
	}

	disconnectedCallback() {
		var input = this._input;
		if (input && input.rangeSlider) input.rangeSlider.destroy();
	}
}

HTMLInputElement.prototype.rangeFill = function(val) {
	this.value = val;
	if (this.rangeSlider) this.rangeSlider.update();
	if (!this.required && val == this.dataset.default) this.disabled = true;
	else this.disabled = false;
};

HTMLInputElement.prototype.rangeReset = function() {
	this.rangeFill(this.dataset.default);
};


Page.setup(function() {
	HTMLCustomElement.define('element-input-range', HTMLElementInputRange);
});
