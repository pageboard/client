class HTMLElementTime extends HTMLTimeElement {
	constructor() {
		super();
		if (this.init) this.init();
	}

	static defaults = {
		dataFormat: null,
		dataTimezone: null,
		datetime: null
	};

	patch(state) {
		this.textContent = `[stamp|formatDate:[fmt]:[tz]]`.fuse({
			stamp: this.dateTime,
			fmt: this.dataset.format,
			tz: this.dataset.timezone
		}, state.scope);
	}
}

VirtualHTMLElement.define(`element-time`, HTMLElementTime, 'time');
