class HTMLElementInputDateSlot extends VirtualHTMLElement {
	static get observedAttributes() {
		return ['start', 'end', 'time-zone'];
	}

	setup(state) {
		var els = Array.from(this.querySelectorAll('element-input-date-time'));
		if (els.length == 0) return;
		if (els.length == 2) {
			els.unshift(this.ownerDocument.createElement('element-input-date-time'));
			this.insertBefore(els[0], els[1]);
		}
		if (els.length != 3) {
			throw new Error("Expected three element-input-date-time");
		}
		this._els = els;
		var tz = this.getAttribute('time-zone');
		els[0].timeZone = tz;
		els[1].timeZone = tz;
		els[2].timeZone = tz;
		els[0].format = "date";
		els[1].format = "time";
		els[2].format = "time";
		els[0].value = els[1].value = this.getAttribute('start');
		els[2].value = this.getAttribute('end');
	}

	handleChange(e, state) {
		if (e.target.closest('element-input-date-time') == this._els[0]) this.dateChange(e);
		this.timeChange(e);
	}

	dateChange(e) {
		var date = e.target.parentNode.value || (new Date()).toISOString();
		var startEl = this._els[1];
		var time = (startEl.value || date).split('T').pop();
		if (!date) return;
		var startVal = date.split('T').shift() + 'T' + time;
		startEl.value = startVal;
	}

	timeChange(e) {
		var start = new Date(this._els[1].value);
		var end = new Date(this._els[2].value);
		var startTime = start.getTime();
		var endTime = end.getTime();
		if (Number.isNaN(endTime)) endTime = startTime;
		if (Number.isNaN(startTime)) return;
		// keep start and end on the same day
		if (endTime >= startTime) return;
		if (start.getDate() > end.getDate()) {
			end.setDate(start.getDate());
		} else {
			end = start;
		}
		this._els[2].value = end.toISOString();
	}

	attributeChangedCallback(name, old, val) {
		if (!this._els) return;
		if (name == "start") {
			this._els[0].value = val;
			this._els[1].value = val;
		} else if (name == "end") {
			this._els[2].value = val;
		} else if (name == "time-zone") {
			this._els[0].timeZone = val;
			this._els[1].timeZone = val;
			this._els[2].timeZone = val;
		}
	}

	close() {
		if (this._els) delete this._els;
	}
}

VirtualHTMLElement.define('element-input-date-slot', HTMLElementInputDateSlot);

