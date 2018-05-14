class HTMLElementInputDateTime extends HTMLCustomElement {
	static get observedAttributes() {
		return ['value'];
	}
	connectedCallback() {
		var inputs = this.querySelectorAll('input');
		if (inputs.length == 0) return;
		var input = inputs[0];
		var hidden;
		if (inputs.length == 2) {
			hidden = inputs[1];
		} else {
			hidden = input.ownerDocument.createElement('input');
			hidden.type = 'hidden';
			hidden.name = input.name;
			input.removeAttribute('name');
			input.parentNode.appendChild(hidden);
		}
		var val = this.getAttribute("value");
		if (val == null) val = input.value;
		else input.value = val;
		hidden.value = val;
		var format = input.dataset.format;
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
		if (this._datetime) this._datetime.destroy();
		this._datetime = window.DateTimeEntry(input, {
			locale: lang,
			format: fmt,
			useUTC: false,
			onChange: function(val) {
				var str = val.toISOString();
				if (format == "time") {
					str = str.split('T').pop();
				} else if (format == "date") {
					str = str.split('T').shift();
				}
				hidden.value = str;
			}
		});
	}

	attributeChangedCallback(attributeName, oldValue, newValue) {
		if (attributeName != "value") return;
		if (this._datetime) {
			this._datetime.setTime(newValue);
		}
	}

	disconnectedCallback() {
		if (this._datetime) {
			this._datetime.destroy();
			delete this._datetime;
		}
	}
}


Page.setup(function() {
	HTMLCustomElement.define('element-input-date-time', HTMLElementInputDateTime);
});
