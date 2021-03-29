class HTMLElementInputDateTime extends VirtualHTMLElement {
	static get observedAttributes() {
		return ['value', 'format', 'time-zone'];
	}
	get format() {
		return this.getAttribute('format') || 'datetime';
	}
	set format(f) {
		if (f) this.setAttribute('format', f);
		else this.removeAttribute('format');
	}
	get timeZone() {
		return this.getAttribute('time-zone');
	}
	set timeZone(f) {
		if (f) this.setAttribute('time-zone', f);
		else this.removeAttribute('time-zone');
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
		var tz = this.timeZone;
		this._dt = window.DateTimeEntry(this._view, {
			step: input.getAttribute('step'),
			locale: document.documentElement.lang || window.navigator.language,
			format: this._formatOptions(this.format, tz),
			useUTC: !!tz,
			onChange: function(val) {
				this.value = val.toISOString();
				if (this._input.value != this.value) this._input.value = this.value;
			}.bind(this)
		});
	}

	attributeChangedCallback(name, old, val) {
		if (old == val || !this._dt) return;
		if (name == "format" || name == "time-zone") {
			var props = this._dt.props;
			var tz = this.timeZone;
			props.format = this._formatOptions(val || 'datetime', tz);
			props.useUTC = !!tz;
			this._dt.setOptions(props);
		} else if (name == "value") {
			this._input.value = val;
			this._dt.setTime(val);
		}
	}

	_formatOptions(format, tz) {
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
		if (tz) fmt.timeZone = tz;
		return fmt;
	}

	close() {
		if (this._dt) {
			this._dt.destroy();
			delete this._dt;
		}
	}
}



VirtualHTMLElement.define('element-input-date-time', HTMLElementInputDateTime);

