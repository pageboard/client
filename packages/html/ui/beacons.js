class HTMLElementBeacons extends Page.create(HTMLMetaElement) {
	patch(state) {
		if (!this.content) return;
		const scope = state.scope.copy();
		const collector = state.collector();
		scope.$hooks = {
			...scope.$hooks,
			afterAll(ctx, v) {
				collector.filter(ctx, v);
			}
		};
		for (const expr of Object.values(state.parse(this.content).query)) {
			`[${expr}]`.fuse({}, state.scope);
		}
	}
	paint(state) {
		if (state.scope.$write || state.scope.$read || !this.content) return;
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

