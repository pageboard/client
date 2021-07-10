class HTMLElementInputDateSlot extends VirtualHTMLElement {
	static defaults = {
		timeZone: null,
		range: null,
		step: 0
	};

	handleChange(e, state) {
		const els = this.inputs;
		if (els.length == 3 && e.target.closest('element-input-date-time') == els[0]) {
			this.dateChange(e);
		}
		this.timeChange(e);
	}

	dateChange(e) {
		const date = e.target.parentNode.value || (new Date()).toISOString();
		const els = this.inputs;
		els[1].setDate(date);
		els[2].setDate(date);
	}

	timeChange(e) {
		const els = this.inputs;
		const startEl = els[els.length - 2];
		const endEl = els[els.length - 1];
		const isStart = e.target.parentNode == startEl;
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
		return Array.from(this.querySelectorAll('element-input-date-time'));
	}

	patch(state) {
		const els = this.inputs;
		const dayRange = this.options.step < 60 * 60 * 24;
		if (els.length == 2 && dayRange) {
			els.unshift(this.ownerDocument.createElement('element-input-date-time'));
			els[0].innerHTML = '<input name="" type="hidden">';
			this.insertBefore(els[0], els[1]);
		}
		const dts = els.map(el => el.dataset);

		const tz = this.options.timeZone;
		if (tz) dts.forEach(dt => { dt.timeZone = tz; } );
		else dts.forEach(dt => { delete dt.timeZone; } );


		if (dayRange) {
			dts[0].format = "date";
			dts[1].step = dts[2].step = this.options.step;
			dts[1].format = dts[2].format = "time";
			els[0].value = els[1].value || "";
		} else {
			dts[0].format = "date";
			dts[1].format = "date";
		}
	}
}

VirtualHTMLElement.define('element-input-date-slot', HTMLElementInputDateSlot);

