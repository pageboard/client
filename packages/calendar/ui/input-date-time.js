class HTMLElementInputDateTime extends VirtualHTMLElement {
	static get defaults() {
		return {
			format: (str) => {
				if (['date', 'time', 'datetime'].includes(str)) return str;
				else return 'datetime';
			},
			timeZone: null,
			step: 0
		};
	}

	get value() {
		return this.querySelector('input').value;
	}

	set value(val) {
		this.querySelector('input').value = val;
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
		var view = this.querySelector('input:not([name])');
		if (!view) {
			view = this.ownerDocument.createElement('input');
			this.appendChild(view);
		}
		if (!this.querySelector('.controls')) {
			this.insertAdjacentHTML('beforeEnd', '<div class="controls"><span class="incr"></span><span class="decr"></span></div>');
		}

		view.value = this.value;

		this._dt = new window.DateTimeEntry(view, {
			step: this.options.step || null,
			locale: document.documentElement.lang || window.navigator.language,
			format: this.formatFromOptions(),
			useUTC: !!this.options.timeZone,
			onChange: function(val) {
				this.value = Number.isNaN(val.getTime()) ? "" : val.toISOString();
			}.bind(this)
		});
	}

	patch(state) {
		if (!this._dt) return;
		this._dt.setOptions({
			format: this.formatFromOptions(),
			useUTC: !!this.options.timeZone,
			step: this.options.step || null
		});
		this._dt.setTime(this.value);
	}

	setDate(date) {
		var time = (this.value || date).split('T').pop();
		this.value = date.split('T').shift() + 'T' + time;
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

