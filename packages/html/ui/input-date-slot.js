class HTMLElementInputDateSlot extends VirtualHTMLElement {
	static defaults = {
		range: null,
		step: 0
	};

	handleChange(e, state) {
		const els = this.inputs;
		if (els.length == 3 && e.target == els[0]) {
			this.dateChange(e);
		}
		this.timeChange(e);
	}

	dateChange(e) {
		const date = e.target.value || (new Date()).toISOString();
		const els = this.inputs;
		els[1].setDate(date); // FIXME
		els[2].setDate(date);
	}

	timeChange(e) {
		const els = this.inputs;
		const startEl = els[els.length - 2];
		const endEl = els[els.length - 1];
		const isStart = e.target == startEl;
		const start = new Date(startEl.value);
		const end = new Date(endEl.value);
		const startTime = start.getTime();
		let endTime = end.getTime();
		if (Number.isNaN(endTime)) endTime = startTime;
		if (Number.isNaN(startTime)) return;
		if (endTime >= startTime) return;
		let startPart, endPart, changed = false;
		for (const Part of ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds']) {
			startPart = start[`get${Part}`]();
			endPart = end[`get${Part}`]();
			if (startPart > endPart) {
				changed = true;
				if (isStart) {
					end[`set${Part}`](startPart);
				} else {
					start[`set${Part}`](endPart);
				}
			}
		}
		if (changed) {
			if (isStart) {
				endEl.value = end.toISOString();
			} else {
				startEl.value = start.toISOString();
			}
		}
	}
	get inputs() {
		return Array.from(this.querySelectorAll('input'));
	}

	patch(state) {
		const els = this.inputs;
		const dayRange = this.options.step < 60 * 60 * 24;
		if (els.length == 2 && dayRange) {
			els.unshift(this.ownerDocument.createElement('input'));
			this.insertBefore(els[0], els[1]);
		}
		const dts = els.map(el => el.dataset);

		if (dayRange) {
			dts[0].type = "date";
			dts[1].step = dts[2].step = this.options.step;
			dts[1].type = dts[2].type = "time";
			els[0].value = els[1].value || "";
		} else {
			dts[0].type = "date";
			dts[1].type = "date";
		}
	}
}

VirtualHTMLElement.define('element-input-date-slot', HTMLElementInputDateSlot);

