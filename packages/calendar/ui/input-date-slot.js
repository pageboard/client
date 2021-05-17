class HTMLElementInputDateSlot extends VirtualHTMLElement {
	static get defaults() {
		return {
			timeZone: null,
			range: null,
			step: 0
		};
	}

	handleChange(e, state) {
		var els = this.inputs;
		if (els.length == 3 && e.target.closest('element-input-date-time') == els[0]) {
			this.dateChange(e);
		}
		this.timeChange(e);
	}

	dateChange(e) {
		var date = e.target.parentNode.value || (new Date()).toISOString();
		var els = this.inputs;
		els[1].setDate(date);
		els[2].setDate(date);
	}

	timeChange(e) {
		var els = this.inputs;
		var startEl = els[els.length - 2];
		var endEl = els[els.length - 1];
		var isStart = e.target.parentNode == startEl;
		var start = new Date(startEl.value);
		var end = new Date(endEl.value);
		var startTime = start.getTime();
		var endTime = end.getTime();
		if (Number.isNaN(endTime)) endTime = startTime;
		if (Number.isNaN(startTime)) return;
		if (endTime >= startTime) return;
		var startPart, endPart, changed = false;
		for (var Part of ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds']) {
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
		var els = this.inputs;
		var dayRange = this.options.step < 60 * 60 * 24;
		if (els.length == 2 && dayRange) {
			els.unshift(this.ownerDocument.createElement('element-input-date-time'));
			els[0].innerHTML = '<input name="" type="hidden">';
			this.insertBefore(els[0], els[1]);
		}
		var dts = els.map(el => el.dataset);

		var tz = this.options.timeZone;
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

