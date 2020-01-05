class HTMLElementInputRange extends HTMLCustomElement {
	// changing only one value, connected to the minimum value
	setup() {
		var node = this.querySelector('input');
		if (!node) return;
		var minimum = parseFloat(node.getAttribute('min'));
		var start = parseFloat(node.value || node.dataset.default);
		var step = parseFloat(node.getAttribute('step'));
		var maximum = parseFloat(node.getAttribute('max'));
		window.noUiSlider.create(this, {
			start: [minimum, start],
			step: step,
			range: {
				min: [minimum],
				max: [maximum]
			},
			connect: true
		}).on('change', function(values) {
			var val = values[1];
			node.rangeFill(val);
			var e = document.createEvent('HTMLEvents');
			e.initEvent('change', true, true);
			node.dispatchEvent(e);
		});
		this.querySelector('.noUi-origin').setAttribute('disabled', 'true');
		node.rangeFill(node.value);
	}

	close() {
		if (this.noUiSlider) this.noUiSlider.destroy();
	}
}

HTMLInputElement.prototype.rangeFill = function(val) {
	if (val == null) val = "";
	else val = val.toString();
	this.value = val.length ? val : this.dataset.default;
	if (this.parentNode && this.parentNode.noUiSlider) {
		this.parentNode.noUiSlider.set([null, parseFloat(val)]);
	}
	if (!this.required && val == this.dataset.default) this.disabled = true;
	else this.disabled = false;
};

HTMLInputElement.prototype.rangeReset = function() {
	this.rangeFill(this.dataset.default);
};


Page.setup(function() {
	HTMLCustomElement.define('element-input-range', HTMLElementInputRange);
});
