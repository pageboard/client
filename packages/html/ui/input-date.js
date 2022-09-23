class HTMLElementInputDate extends HTMLInputElement {
	constructor() {
		super();
		if (this.init) this.init();
	}

	patch() {
		if (this.type == "date" && this.step < 86400) this.removeAttribute('step');
	}

	setAttribute(name, value) {
		if (name == "value") {
			this.value = value;
			value = super.value;
		}
		super.setAttribute(name, value);
	}

	get valueAsDate() {
		let str = super.value;
		if (!str) return null;
		if (this.type == "time") {
			str = `1970-01-01T${str}`;
		}
		const d = new Date(str + 'Z');
		const t = d.getTime();
		if (Number.isNaN(t)) return null;
		const tz = d.getTimezoneOffset();
		d.setTime(t + tz * 60 * 1000);
		return d;
	}
	set valueAsDate(d) {
		let t = d?.getTime();
		if (!d || Number.isNaN(t)) {
			super.value = "";
			return;
		}
		d = new Date(t);
		const step = this.step * 1000;
		if (step) {
			t = Math.round(t / step) * step;
			d.setTime(t);
		}
		const tz = d.getTimezoneOffset();
		d.setTime(t - tz * 60 * 1000);
		const str = d.toISOString().replace(/Z$/, '');
		if (this.type == "time") {
			super.value = str.split('T')[1];
		} else if (this.type == "date") {
			super.value = str.split('T')[0];
		} else {
			super.value = str;
		}
	}

	get value() {
		return this.valueAsDate?.toISOString();
	}
	set value(str) {
		this.valueAsDate = new Date(str);
	}

	get type() {
		return super.type;
	}
	set type(t) {
		const str = super.value;
		super.type = t;
		this.value = str;
	}
}

VirtualHTMLElement.define('element-input-date', HTMLElementInputDate, 'input');
