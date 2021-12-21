class HTMLElementInputDateSlot extends VirtualHTMLElement {
	handleChange(e, state) {
		this.update(e.target);
	}

	get type() {
		const type = this.getAttribute('type');
		const step = this.step;
		if (step) {
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

		let start = startEl.valueAsDate;
		let end = endEl.valueAsDate;
		if (!start && !end) return;
		if (!start) start = new Date(end);
		else if (!end) end = new Date(start);
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
		endEl.valueAsDate = end;
		startEl.valueAsDate = start;
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
		start.type = end.type = type;
	}
}

VirtualHTMLElement.define('element-input-date-slot', HTMLElementInputDateSlot);

