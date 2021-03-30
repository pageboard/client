class HTMLElementInputDateTime extends VirtualHTMLElement {
	static get defaults() {
		return {
			value: null,
			format: (str) => {
				if (['date', 'time', 'datetime'].includes(str)) return str;
				else return 'datetime';
			},
			timeZone: null,
			step: 0
		};
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
		view.value = this.options.value;
		if (!input.value && view.value) input.value = view.value;

		this._dt = window.DateTimeEntry(this._view, {
			step: this.options.step || null,
			locale: document.documentElement.lang || window.navigator.language,
			format: this.formatFromOptions(),
			useUTC: !!this.options.timeZone,
			onChange: function(val) {
				this.dataset.value = val.toISOString();
			}.bind(this)
		});
	}

	patch(state) {
		if (!this._dt) return;
		this._dt.setOptions(Object.assign(this._dt.props, {
			format: this.formatFromOptions(),
			useUTC: !!this.options.timeZone,
			step: this.options.step || null
		}));
		var date = new Date(this.options.value);
		if (Number.isNaN(date.getTime())) {
			this.options.value = "";
			date = null;
		}
		this._input.value = this.options.value;
		if (date) this._dt.setTime(date);
	}

	setDate(date) {
		var time = (this.options.value || date).split('T').pop();
		this.dataset.value = date.split('T').shift() + 'T' + time;
	}

	formatFromOptions() {
		var obj = {};
		var l = 'long';
		var n = 'numeric';
		var d = '2-digit';
		var format = this.options.format;
		if (this.options.step == 60 * 60 * 24) format = 'date';
		if (format.startsWith('date')) Object.assign(obj, {
			year: n,
			month: l,
			day: n
		});
		if (format.endsWith("time")) Object.assign(obj, {
			hour12: false,
			hour: d,
			minute: d
		});
		if (this.options.timeZone) obj.timeZone = this.options.timeZone;
		return obj;
	}

	close() {
		if (this._dt) {
			this._dt.destroy();
			delete this._dt;
		}
	}
}



VirtualHTMLElement.define('element-input-date-time', HTMLElementInputDateTime);

