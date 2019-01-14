class HTMLElementInputDateTime extends HTMLCustomElement {
	static get observedAttributes() {
		return ['value', 'format'];
	}
	get format() {
		return this.getAttribute('format') || 'datetime';
	}
	set format(f) {
		if (f) this.setAttribute('format', f);
		else this.removeAttribute('format');
	}
	get value() {
		return this.getAttribute('value');
	}
	set value(v) {
		if (v) this.setAttribute('value', v);
		else this.removeAttribute('value');
	}

	handleClick(e, state) {
		if (e.target.classList.contains('incr')) {
			this._dt.step(1);
		} else if (e.target.classList.contains('decr')) {
			this._dt.step(-1);
		} else return;
	}

	handleMousedown(e, state) {
		if (e.target.closest('.controls')) {
			e.preventDefault();
		}
	}

	setup(state) {
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
		this._view = view;
		this._input = input;
		if (!this.querySelector('.controls')) {
			this.insertAdjacentHTML('beforeEnd', '<div class="controls"><span class="incr"></span><span class="decr"></span></div>');
		}
		view.value = this.getAttribute('value') || input.value;
		if (!input.value && view.value) input.value = view.value;
		this._dt = window.DateTimeEntry(this._view, {
			locale: document.documentElement.lang || window.navigator.language,
			format: this._formatOptions(this.format),
			useUTC: false,
			onChange: function(val) {
				input.value = val.toISOString();
			}
		});
	}

	attributeChangedCallback(name, old, val) {
		if (old == val || !this._dt) return;
		if (name == "format") {
			var props = this._dt.props;
			props.format = this._formatOptions(val || 'datetime');
			this._dt.setOptions(props);
		} else if (name == "value") {
			this._input.value = val;
			this._dt.setTime(val);
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

	close() {
		if (this._dt) {
			this._dt.destroy();
			delete this._dt;
		}
	}
}



HTMLCustomElement.define('element-input-date-time', HTMLElementInputDateTime);

