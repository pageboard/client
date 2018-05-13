class HTMLElementInputDateTime extends HTMLCustomElement {
	connectedCallback() {
		this._input = this.querySelector('input');
		if (!this._input) return;
		var format = this._input.dataset.format;
		var l = 'long';
		var n = 'numeric';
		var d = '2-digit';
		var fmt = {};
		if (format.startsWith('date')) Object.assign(fmt, {
			year: n,
			month: l,
			day: n
		});
		if (format.endsWith("time")) Object.assign(fmt, {
			hour12: false,
			hour: d,
			minute: d,
			second: d
		});
		var lang = document.documentElement.lang || window.navigator.language;
		this._datetime = window.DateTimeEntry(this._input, {
			locale: lang,
			format: fmt,
			useUTC: true
		});
//		this.addEventListener('change', this._change, false);
	}

	_change(e) {
		var input = e.target;
		if (input.getAttribute('type') == "time") {
			var val = input.value;
			if (/^\d{1,2}\:\d{1,2}$/.test(val)) input.value = val + ':00';
		}
	}

	disconnectedCallback() {
		if (this._datetime) {
			this._datetime.destroy();
			delete this._datetime;
		}
//		this.removeEventListener('change', this._change, false);
	}
}


Page.setup(function() {
	HTMLCustomElement.define('element-input-date-time', HTMLElementInputDateTime);
});
