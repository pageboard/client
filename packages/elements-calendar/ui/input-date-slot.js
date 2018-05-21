class HTMLElementInputDateSlot extends HTMLCustomElement {
	static get observedAttributes() {
		return ['start', 'end'];
	}
	init() {
		this.dateChange = this.dateChange.bind(this);
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
	}

	dateChange(e) {
		var date = e.target.parentNode.value;
		var startEl = this._els[1];
		var time = (startEl.value || '0T0:0:0Z').split('T').pop();
		if (!date) return;
		startEl.value = date.split('T').shift() + 'T' + time;
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
			delete this._els;
		}
	}
}


Page.setup(function() {
	HTMLCustomElement.define('element-input-date-slot', HTMLElementInputDateSlot);
});
