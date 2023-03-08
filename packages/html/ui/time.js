class HTMLElementTime extends Page.create(HTMLTimeElement) {
	static defaults = {
		dataFormat: null,
		dataTimezone: null,
		datetime: null
	};

	patch(state) {
		this.textContent = `[stamp|or:now|date:[fmt]:[tz]]`.fuse({
			stamp: this.dateTime,
			fmt: this.dataset.format,
			tz: this.dataset.timezone
		}, state.scope);
	}
}

Page.define(`element-time`, HTMLElementTime, 'time');
