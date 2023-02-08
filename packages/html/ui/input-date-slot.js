class HTMLElementInputDateSlot extends Page.Element {
	handleChange(e, state) {
		this.update(e.target);
	}

	get type() {
		const type = this.getAttribute('type');
		const step = this.step;
		if (step && !type) {
			if (step >= 86400) return "date";
			else if (type == "date") return "datetime-local";
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

	update(input) {
		const [startEl, endEl] = this.#inputs();
		const isStart = input == startEl;

		const start = startEl.valueAsDate;
		let end = endEl.valueAsDate;
		if (!start && !end) return;
		if (!start) {
			endEl.valueAsDate = null;
			return;
		}
		if (!end) end = new Date(start);
		let startPart, endPart;
		let equal = true;
		for (const Part of ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds']) {
			startPart = start[`get${Part}`]();
			endPart = end[`get${Part}`]();
			if (startPart > endPart && equal) {
				if (isStart) {
					end[`set${Part}`](startPart);
				} else {
					start[`set${Part}`](endPart);
				}
			} else if (startPart != endPart) {
				equal = false;
			}
		}
		endEl.valueAsDate = end;
		startEl.valueAsDate = start;
	}
	#inputs() {
		return Array.from(this.querySelectorAll('input'));
	}

	patch(state) {
		const [ start, end ] = this.#inputs();
		const type = this.type;
		const step = type == "date" ? 0 : this.step;
		if (step) {
			start.setAttribute('step', step);
			end.setAttribute('step', step);
		} else {
			start.removeAttribute('step');
			end.removeAttribute('step');
		}
		start.type = end.type = type;
	}
}

Page.define('element-input-date-slot', HTMLElementInputDateSlot);

