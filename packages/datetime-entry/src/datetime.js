/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/1/17.
 */

(function (window, document) {

	/* eslint-disable no-unused-vars */
	const KEY_TAB = 9,
		KEY_ENTER = 13,
		KEY_BACKSPACE = 8,
		KEY_DELETE = 46,
		KEY_ESCAPE = 27,
		KEY_SPACE = 32,
		KEY_DOWN = 40,
		KEY_UP = 38,
		KEY_LEFT = 37,
		KEY_RIGHT = 39,
		KEY_A = 65,
		KEY_C = 67,
		KEY_V = 86,
		KEY_D = 68,
		KEY_F2 = 113,
		KEY_INSERT = 45;
	/* eslint-enable no-unused-vars */

	const DAYLEN = 86400000;

	const hashTypeFn = {
		'weekday': 'Date',
		'month': 'Month',
		'day': 'Date',
		'year': 'FullYear',
		'hour': 'Hours',
		'minute': 'Minutes',
		'second': 'Seconds',
		'dayperiod': 'Hours',
		'dayPeriod': 'Hours'
	};

	const FORMAT = {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};

	const defaultProps = {
		datetime: NaN,
		locale: navigator.language,
		format: FORMAT,
		useUTC: true,
		minDate: NaN,
		maxDate: NaN,
		minTime: NaN,
		maxTime: NaN,
		step: NaN,
		onChange: () => { }
	};

	window.DateTimeEntry = class DateTimeEntry {
		constructor(element, props) {
			const _props = Object.assign({}, defaultProps, props);

			this.element = element;

			this.element.setSelectionRange(0, 0);

			// this.element.addEventListener('select', this);
			this.element.addEventListener('focus', this);
			this.element.addEventListener('mouseup', this);
			this.element.addEventListener('keydown', this);
			this.element.addEventListener('mousewheel', this);

			this.state = {
				type: undefined,
				parts: [],
				datetime: _props.datetime || element.value,
				step: _props.step || parseInt(element.getAttribute('step'))
			};
			this.setOptions(_props);
		}

		#setState(newPartialState, callback) {

			this.state = Object.assign({}, this.state, newPartialState);

			this.#render();

			if (callback) {
				callback.call(this);
			}

		}

		setOptions(props) {
			this.props = Object.assign({}, this.props, props);

			const format = Object.assign({}, this.props.format);
			if (this.props.useUTC && !format.timeZone) format.timeZone = 'UTC';
			try {
				this.dtFormatter = Intl.DateTimeFormat(this.props.locale, format);
			} catch (err) {
				if (format.timeZone && format.timeZone != "UTC") {
					if (this.props.useUTC) {
						format.timeZone = "UTC";
					} else {
						delete format.timeZone;
					}
					this.dtFormatter = Intl.DateTimeFormat(this.props.locale, format);
				} else {
					throw err;
				}
			}

			let mD = new Date(this.props.minDate).getTime();
			let MD = new Date(this.props.maxDate).getTime();
			let mT = new Date(this.props.minTime).getTime();
			let MT = new Date(this.props.maxTime).getTime();

			this.props.minTime = (mT % DAYLEN + DAYLEN) % DAYLEN; // NaN, number [0...86400000 - 1]
			this.props.maxTime = (MT % DAYLEN + DAYLEN) % DAYLEN;
			this.props.minDate = Number.isNaN(mT) ? mD : mD - mD % DAYLEN; // NaN, number
			this.props.maxDate = Number.isNaN(MT) ? MD : MD - MD % DAYLEN;

			if (!Number.isNaN(this.props.minTime)) {
				this.props.maxTime = Number.isNaN(this.props.maxTime) ? DAYLEN : this.props.maxTime;
			}

			if (!Number.isNaN(this.props.maxTime)) {
				this.props.minTime = Number.isNaN(this.props.minTime) ? 0 : this.props.minTime;
			}

			const state = this._setDateTime(!Number.isNaN(props.datetime) ? props.datetime : this.state.datetime);

			state.step = this.props.step;

			this.#setState(state);


			this.#render();

		}

		getTime() {
			return this.state.datetime;
		}

		setTime(date) {
			const newState = this._setDateTime(date);
			this.#setState(newState, this._notify);
		}

		destroy() {
			this.element.removeEventListener('focus', this);
			this.element.removeEventListener('mouseup', this);
			this.element.removeEventListener('keydown', this);
			this.element.removeEventListener('mousewheel', this);
		}

		#render() {

			let string;

			try {
				string = this.dtFormatter.format(this.state.datetime);
			} catch (E) {
				string = '';
			}

			this.element.value = string;

			this.element.setSelectionRange(0, 0);

			//avoid selection on element without focus (Firefox)
			if (document.activeElement !== this.element) return;

			const type = this.state.type || '';

			const partIndex = this.state.parts.findIndex(p => type ? p.type === type : p.type !== 'literal');

			if (!~partIndex) return;

			const ss = this.state.parts
				.slice(0, partIndex)
				.reduce((p, c) => p + c.value.length, 0);

			const se = ss + this.state.parts[partIndex].value.length;

			this.element.setSelectionRange(ss, se);
		}

		_setDateTime(datetime) {

			let parts, type, step = this.state.step;

			if (typeof datetime == 'string' && /^\d{1,2}:\d{1,2}/.test(datetime)) {
				datetime = '0 ' + datetime;
			}

			datetime = new Date(datetime);

			if (!Number.isNaN(step)) {
				step = step * 1000;
				datetime = new Date(Math.floor(datetime.getTime() / step) * step);
			}

			datetime = this.fitToLimits(datetime);

			try {
				parts = this.dtFormatter.formatToParts(datetime);
				type = this.state.type || parts.find(p => p.type !== 'literal').type;
			} catch (E) {
				parts = [];
				type = undefined;
			}

			return ({ datetime, parts, type, step: this.state.step });

			// this.#setState({
			//	 type,
			//	 datetime,
			//	 parts,
			// }, () => {
			//	 this.props.onChange(datetime);
			// });

		}

		handleEvent(e) {
			if (e.type == "focus") this.#focus(e);
			else if (e.type == "mousedown") this.#mousedown(e);
			else if (e.type == "keydown") this.#keydown(e);
			else if (e.type == "mousewheel") this.#mousewheel(e);
		}

		#focus(e) {
			if (e.target.selectionStart != e.target.selectionEnd) {
				e.preventDefault();
				e.target.focus();
				this._handleMouseDown(e);
			}
		}

		#mousedown(e) {

			e.preventDefault();

			if (Number.isNaN(this.state.datetime)) {

				const dt = new Date();

				if (this.props.useUTC) {
					dt.setUTCHours(dt.getHours(), dt.getMinutes(), dt.getSeconds());
				}

				this.setTime(dt);
				return;
			}

			const parts = this.state.parts;
			let ss = 0,
				se = 0,
				cp = e.target.selectionStart;

			const selection = parts.reduce((p, c) => {
				ss = se;
				se = ss + c.value.length;

				if (c.type !== 'literal' && cp >= ss && cp <= se) {
					p.type = c.type;
					p.ss = ss;
					p.se = se;
				}

				return p;

			}, { type: '', ss: 0, se: 0 });

			this.state.type = selection.type;
			// this.state.ss = selection.ss ;
			// this.state.se = selection.se ;

			this.#render();

		}

		#keydown(e) {

			switch (e.which) {

				case KEY_LEFT: {
					e.preventDefault();
					const type = this.#getNextTypeInDirection(-1);
					if (type) this.#setState({ type });
					break;
				}

				case KEY_RIGHT: {
					e.preventDefault();
					const type = this.#getNextTypeInDirection(1);
					if (type) this.#setState({ type });
					break;
				}

				case KEY_UP: {
					e.preventDefault();
					this.#step(1);
					break;
				}
				case KEY_DOWN: {
					e.preventDefault();
					this.#step(-1);
					break;
				}

				case KEY_DELETE: {
					e.preventDefault();
					const newState = this._setDateTime(new Date(NaN));
					this.#setState(newState, this._notify);

					break;
				}

				case KEY_TAB: {
					const type = this.#getNextTypeInDirection(e.shiftKey ? -1 : 1);
					if (type) {
						e.preventDefault();
						this.#setState({ type });
					}
					break;
				}

				case KEY_A:
				case KEY_C: {
					if (!e.ctrlKey) {
						e.preventDefault();
					}
					break;

				}

				default: {
					// https://github.com/ua9msn/datetime/issues/2
					e.preventDefault();
					// ignore non-numbers
					if (!isFinite(e.key)) return;
					// ignore ampm
					if (this.state.type === 'dayperiod' || this.state.type === 'dayPeriod') return;
					// ignore Weekday
					if (this.state.type === 'weekday') return;

					this.#modify(+e.key, this.state.type);

					break;

				}
			}

		}

		#mousewheel(e) {
			e.preventDefault();
			e.stopPropagation();

			const direction = Math.sign(e.wheelDelta);

			this.#step(direction);

			this.#render();

		}

		#getNextTypeInDirection(direction) {
			direction = Math.sign(direction);

			if (!this.state.parts || !this.state.parts.length) return;

			let curIndex = this.state.parts.findIndex(p => p.type === this.state.type);

			if (!~curIndex) {
				curIndex = this.state.parts.findIndex(p => p.type !== 'literal');
			}

			let ono = false, index = curIndex;

			while (!ono && this.state.parts[index + direction]) {
				index += direction;
				ono = this.state.parts[index] && this.state.parts[index].type !== 'literal';
			}

			return (ono ? this.state.parts[index] : {}).type;
		}

		#step(sign) {
			const newDatetime = this.#crement(sign, this.state);
			const newState = this._setDateTime(newDatetime);
			this.#setState(newState, this._notify);
		}

		#crement(operator, state) {

			const type = state.type;
			const part = this.state.parts.find(p => p.type === type);

			const dt = (!Number.isNaN(this.state.datetime) && this.state.datetime) || this.props.preset || Date.now();

			let proxyTime = new Date(dt);
			const stamp = proxyTime.getTime();

			if (!part || type === 'literal') return proxyTime;

			let fnName = (this.props.useUTC ? 'UTC' : '') + hashTypeFn[type],
				newValue = proxyTime['get' + fnName]();

			if (part.type === 'dayperiod' || part.type === 'dayPeriod') {
				newValue += operator * 12;
			} else if (part.type === 'weekday') {
				newValue += operator;
			} else {
				newValue += operator;
			}

			proxyTime['set' + fnName](newValue);
			let newstamp = proxyTime.getTime();
			const step = state.step;
			if (!Number.isNaN(step) && Math.abs(newstamp - stamp) < step * 1000) {
				newstamp = stamp + operator * step * 1000;
				proxyTime = new Date(newstamp);
			}

			return this.fitToLimits(proxyTime);

		}

		#modify(input, type) {

			const maxValue = this._getMaxFieldValueAtDate(this.state.datetime, type);

			const newDatetime = this._calculateNextValue(input, type, maxValue);

			const newState = this._setDateTime(newDatetime);

			this.#setState(newState, this._notify);

			// if(result !== this.state.datetime) {
			//
			//	 this.#setState({
			//		 datetime: result,
			//		 spares : this._disassembleTimestamp(result, this.state.locale, this.state.format)
			//	 }, this._notify)
			//
			// }
		}

		_getMaxFieldValueAtDate(date, fieldName) {

			const fy = this.props.useUTC ? date.getUTCFullYear() : date.getFullYear();
			const m = this.props.useUTC ? date.getUTCMonth() : date.getMonth();

			switch (fieldName) {
				case 'year':
					return 9999;
				case 'month':
					return 12;
				case 'day':
					return (new Date(fy, m + 1, 0)).getDate(); // get number of days in the month
				case 'hour':
					return 23;
				case 'minute':
					return 59;
				case 'second':
					return 59;
				default:
					break;

			}

		}

		_calculateNextValue(input, type, max) {

			const getFN = 'get' + (this.props.useUTC ? 'UTC' : '') + hashTypeFn[type];
			const setFN = 'set' + (this.props.useUTC ? 'UTC' : '') + hashTypeFn[type];

			let prev = this.state.datetime[getFN]();

			// in spare month has value as for Date (Jan = 0)
			// but user input supposed to be 1 for Jan
			if (type === 'month') {
				prev = prev + 1;
			}

			//append number to the end
			const x = prev * 10 + input;

			// split to summ of digits
			const arr = [x % 10000, x % 1000, x % 100, x % 10];

			// calculate closest less value
			let mm = arr.reduce(function (p, c) {
				return c <= max ? Math.max(p, c) : p;
			}, 0);

			// rollback month value
			// but prevent pass 0
			if (type === 'month') {
				mm = mm ? mm - 1 : prev - 1;
			}

			// Date can not be null.
			// We allow to enter 0 if it makes valid date (10, 20, 30)
			if (type === 'day' && mm === 0) {
				mm = prev;
			}

			let proxyTime = new Date(this.state.datetime);

			proxyTime[setFN](mm);

			const isValid = this.validate(proxyTime);

			if (isValid) {
				return proxyTime;
			} else {

				let isFieldValid = true;
				const maxDateFieldValue = (new Date(this.props.maxDate))[getFN]();
				const minDateFieldValue = (new Date(this.props.minDate))[getFN]();
				const minTimeFieldValue = (new Date(this.props.minTime))[getFN](); //NaN, number
				const maxTimeFieldValue = (new Date(this.props.maxTime))[getFN]();
				const thisValue = proxyTime[getFN]();

				if (type === 'year' || type === 'month' || type === 'day') {
					isFieldValid = !(maxDateFieldValue < thisValue) && !(thisValue < minDateFieldValue);
				}

				if (type === 'hour' || type === 'minute' || type === 'second') {

					if (maxTimeFieldValue > minTimeFieldValue) {
						isFieldValid = !((maxDateFieldValue || maxTimeFieldValue) < thisValue) && !(thisValue < (minTimeFieldValue || minDateFieldValue));
					} else {
						isFieldValid = !((maxDateFieldValue || maxTimeFieldValue) > thisValue) && !(thisValue > (minTimeFieldValue || minDateFieldValue));
					}
				}

				if (isFieldValid) {
					proxyTime = this.fitToLimits(proxyTime);
					return proxyTime;
				}

				// spare.buffer = (spare.buffer || 0) * 10 + input;

				return this.state.datetime;

			}

		}

		validate(datetime) {

			const timestamp = datetime.getTime();
			const timePart = (timestamp % DAYLEN + DAYLEN) % DAYLEN;
			const datePart = timestamp - timePart;

			let validTime = true,
				validDate = true;

			const isMaxDate = isFinite(this.props.maxDate);
			const isMaxTime = isFinite(this.props.maxTime);
			const isMinDate = isFinite(this.props.minDate);
			const isMinTime = isFinite(this.props.minTime);
			const isNightRange = this.state.minTime > this.state.maxTime;

			if (isMinTime && isMaxTime) {
				validTime = isNightRange
					? this.props.maxTime >= timePart || timePart >= this.props.minTime
					: this.props.maxTime >= timePart && timePart >= this.props.minTime;
			}

			if (isMinDate && !isMinTime) {
				validDate = validDate && (timestamp >= this.props.minDate);
			}

			if (isMaxDate && !isMaxTime) {
				validDate = validDate && (timestamp <= this.props.maxDate);
			}

			if (isMinDate && isMinTime) {
				validDate = validDate && (datePart >= this.props.minDate);
			}

			if (isMaxDate && isMaxTime) {
				validDate = validDate && (datePart <= this.props.maxDate);
			}

			return validDate && validTime;

		}

		fitToLimits(datetime) {

			if (Number.isNaN(datetime)) return datetime;

			const timestamp = datetime.getTime();

			let timePart = (timestamp % DAYLEN + DAYLEN) % DAYLEN; //this is trick for negative timestamps
			let datePart = timestamp - timePart;

			if (!Number.isNaN(this.props.minTime) && !Number.isNaN(this.props.maxTime)) {

				if (this.props.maxTime > this.props.minTime) {
					timePart = Math.max(this.props.minTime, Math.min(this.props.maxTime, timePart));
				} else {
					let nearestLimit = Math.abs(timePart - this.props.maxTime) < Math.abs(timePart - this.props.minTime)
						? this.props.maxTime
						: this.props.minTime;
					timePart = timePart > this.props.minTime || timePart < this.props.maxTime ? timePart : nearestLimit;
				}

				if (!Number.isNaN(this.props.minDate)) {
					datePart = Math.max(datePart, this.props.minDate);
				}

				if (!Number.isNaN(this.props.maxDate)) {
					datePart = Math.min(datePart, this.props.maxDate);
				}

			} else {

				timePart = 0;

				let mD = Number.isNaN(this.props.minDate) ? -Infinity : this.props.minDate;
				let MD = Number.isNaN(this.props.maxDate) ? Infinity : this.props.maxDate;

				datePart = Math.max(mD, Math.min(MD, timestamp));

				if (Number.isNaN(datePart)) {
					datePart = timestamp;
				}
			}

			return new Date(datePart + timePart);

		}

		_notify() {
			this.props.onChange(this.state.datetime);
			var e;
			if (document.createEvent) {
				e = document.createEvent('HTMLEvents');
				e.initEvent('change', true, true);
			} else {
				e = new Event('change', { bubbles: true, cancelable: true });
			}
			this.element.dispatchEvent(e);
		}


	};

})(window, document);
