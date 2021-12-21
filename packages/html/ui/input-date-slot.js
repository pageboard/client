class HTMLElementInputDateSlot extends VirtualHTMLElement {
	handleChange(e, state) {
		this.update(e.target);
	}

	get type() {
		const type = this.getAttribute('type');
		const step = this.step;
		if (step) {
			if (step >= 86400) return "date";
			else if (type == "date") return "datetime";
		}
		return type;
	}
	set type(f) {
		this.setAttribute('type', f);
	}
	get step() {
		const step = parseInt(this.getAttribute('step'));
		if (Number.isNaN(step)) return null;
		else return step;
	}
	set step(val) {
		if (!val) this.removeAttribute('step');
		else this.setAttribute('step', val);
	}

	#setValue(input, date) {
		const step = this.step * 1000;
		if (step) {
			const t = date.getTime();
			date.setTime(Math.round(t / step) * step);
		}
		date = date.toISOString().replace(/Z$/, '');
		if (input.type == "date") date = date.split('T').shift();
		else if (input.type == "time") date = date.split('T').pop();
		input.value = date;
	}

	#getValue(input) {
		let str = input.value;
		if (!str.endsWith('Z')) str += 'Z';
		return new Date(str);
	}

	update(input) {
		const [startEl, endEl] = this.#inputs();
		const isStart = input == startEl;

		const start = this.#getValue(startEl);
		const end = this.#getValue(endEl);
		const startTime = start.getTime();
		const endTime = end.getTime();
		const notStart = Number.isNaN(startTime);
		const notEnd = Number.isNaN(endTime);
		if (notStart && notEnd) return;
		if (notStart && !isStart) {
			start.setTime(endTime);
		} else if (notEnd && isStart) {
			end.setTime(startTime);
		}
		let startPart, endPart;
		for (const Part of ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds']) {
			startPart = start[`get${Part}`]();
			endPart = end[`get${Part}`]();
			if (startPart > endPart) {
				if (isStart) {
					end[`set${Part}`](startPart);
				} else {
					start[`set${Part}`](endPart);
				}
			}
		}
		this.#setValue(endEl, end);
		this.#setValue(startEl, start);
	}
	#inputs() {
		return Array.from(this.querySelectorAll('input'));
	}

	patch(state) {
		const [ start, end ] = this.#inputs();
		const type = this.type;
		let step = this.step;
		if (step) {
			if (type == "date") step = Math.round(step / 86400);
			start.setAttribute('step', step);
			end.setAttribute('step', step);
		} else {
			start.removeAttribute('step');
			end.removeAttribute('step');
		}
		start.type = end.type = type == "datetime" ? "datetime-local" : type;
	}
}

VirtualHTMLElement.define('element-input-date-slot', HTMLElementInputDateSlot);

