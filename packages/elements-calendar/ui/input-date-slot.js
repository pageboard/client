class HTMLElementInputDateSlot extends HTMLCustomElement {
	static get observedAttributes() {
		return ['start', 'end'];
	}
	init() {
		this.dateChange = this.dateChange.bind(this);
		this.timeChange = this.timeChange.bind(this);
	}
	connectedCallback() {
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
		els[0].format = "date";
		els[1].format = "time";
		els[2].format = "time";
		els[0].value = els[1].value = this.getAttribute('start');
		els[2].value = this.getAttribute('end');
		els[0].addEventListener('change', this.dateChange);
		els[1].addEventListener('change', this.timeChange);
		els[2].addEventListener('change', this.timeChange);
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
		var startVal = new Date(this._els[1].value).getTime();
		var endVal = new Date(this._els[2].value).getTime();
		if (isNaN(endVal) || !isNaN(startVal) && endVal < startVal) {
			this._els[2].value = this._els[1].value;
		}
	}

	attributeChangedCallback(name, old, val) {
		if (!this._els) return;
		if (name == "start") {
			this._els[0].value = val;
			this._els[1].value = val;
		} else if (name == "end") {
			this._els[2].value = val;
		}
	}

	disconnectedCallback() {
		if (this._els) {
			this._els[0].removeEventListener('change', this.dateChange);
			this._els[1].removeEventListener('change', this.timeChange);
			this._els[2].removeEventListener('change', this.timeChange);
			delete this._els;
		}
	}
}


Page.setup(function() {
	HTMLCustomElement.define('element-input-date-slot', HTMLElementInputDateSlot);
});
