class HTMLElementInputDateTime extends HTMLCustomElement {
	init() {
		this.controlListener = this.controlListener.bind(this);
	}
	static get observedAttributes() {
		return ['value', 'format'];
	}
	get format() {
		return this.getAttribute('format') || 'datetime';
	}
	set format(f) {
		this.setAttribute('format', f);
	}
	get value() {
		return this._input ? this._input.value : null;
	}
	set value(v) {
		this._input.value = v;
		this._dt.setTime(v);
	}

	controlListener(e) {
		if (e.target.classList.contains('incr')) {
			this._dt.step(1);
		} else if (e.target.classList.contains('decr')) {
			this._dt.step(-1);
		} else return;
	}

	controlDownListener(e) {
		if (e.target.closest('.controls')) {
			e.preventDefault();
		}
	}

	connectedCallback() {
		this.addEventListener('click', this.controlListener);
		this.addEventListener('mousedown', this.controlDownListener);

		var input = this.querySelector('input[type="hidden"]');
		var view = this.querySelector('input:not([type="hidden"])');
		if (!view && !input) {
			input = this.ownerDocument.createElement('input');
			input.setAttribute('type', 'hidden');
			this.appendChild(input);
		}
		if (view && !input) {
			input = view;
			input.setAttribute('type', 'hidden');
			view = null;
		}
		if (!view) {
			view = this.ownerDocument.createElement('input');
			this.insertBefore(view, input);
		}
		this._input = input;
		if (!this.querySelector('.controls')) {
			this.insertAdjacentHTML('beforeEnd', '<div class="controls"><span class="incr"></span><span class="decr"></span></div>');
		}

		var lang = document.documentElement.lang || window.navigator.language;
		view.value = this.getAttribute('value') || input.value;

		this._dt = window.DateTimeEntry(view, {
			locale: lang,
			format: this._formatOptions(this.format),
			useUTC: false,
			onChange: function(val) {
				input.value = val.toISOString();
			}
		});
	}

	attributeChangedCallback(name, old, val) {
		if (!this._dt) return;
		if (name == "value") {
			this._dt.setTime(val);
		} else if (name == "format") {
			var props = this._dt.props;
			props.format = this._formatOptions(val || 'datetime');
			this._dt.setOptions(props);
		}
	}

	_formatOptions(format) {
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
			minute: d
		});
		return fmt;
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.controlListener);
		this.removeEventListener('mousedown', this.controlDownListener);
		if (this._dt) {
			this._dt.destroy();
			delete this._dt;
		}
	}
}


Page.setup(function() {
	HTMLCustomElement.define('element-input-date-time', HTMLElementInputDateTime);
});
