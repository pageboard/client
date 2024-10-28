class HTMLElementBeacons extends Page.create(HTMLMetaElement) {
	paint(state) {
		const payload = new URLSearchParams();
		let i = 0;
		for (const [key, expr] of Object.entries(state.parse(this.content).query)) {
			const result = `[${expr}]`.fuse({}, state.scope);
			if (result) payload.append('names.' + i++, key);
		}
		if (i > 0) navigator.sendBeacon('/@api/stat/beacons', payload);
	}
}

Page.define('element-beacons', HTMLElementBeacons, "meta");

