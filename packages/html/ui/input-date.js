class HTMLElementInputDate extends HTMLInputElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	get valueAsDate() {
		let str = super.value;
		if (!str) return null;
		if (this.type == "time") {
			str = `1970-01-01T${str}`;
		}
		const d = new Date(str + 'Z');
		if (Number.isNaN(d.getTime())) return null;
		return d;
	}
	set valueAsDate(d) {
		if (!d || Number.isNaN(d.getTime())) {
			super.value = "";
			return;
		}
		const step = this.step * 1000;
		if (step) {
			const t = d.getTime();
			d.setTime(Math.round(t / step) * step);
		}
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

	set type(t) {
		const str = super.value;
		super.type = t;
		this.value = str;
	}
}

VirtualHTMLElement.define('element-input-date', HTMLElementInputDate, 'input');
