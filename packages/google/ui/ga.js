class GoogleAnalytics {
	start() {
		if (this.cid) return;
		var cid = Page.storage.get('ga-cid');
		if (!cid) {
			cid = btoa(new Date * Math.random()).slice(-15, -2);
			Page.storage.set('ga-cid', cid);
		}
		this.cid = cid;
	}
	stop() {
		delete this.cid;
		Page.storage.del('ga-cid');
	}
	send(url, data) {
		var nav = navigator || {};
		if (nav.sendBeacon) {
			nav.sendBeacon(url, data);
		} else {
			var xhr = ('XMLHttpRequest' in window)
				? new window.XMLHttpRequest()
				: new window.ActiveXObject('Microsoft.XMLHTTP');
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Accept', '*/*');
			xhr.send(data);
		}
	}
	track(type, {
		category,
		action,
		label,
		value,
		error,
		fatal
	}={}) {
		if (!this.state || !this.cid || !this.gaid) return;
		const data = {
			v: '1',
			ds: 'web',
			aip: 1, // anonymize by default
			tid: this.gaid,
			cid: this.cid,
			t: type,
			sd: window.screen.colorDepth
				? `${window.screen.colorDepth}-bits`
				: undefined,
			dr: Page.samePath(this.state.referrer, this.state) && document.referrer || undefined,
			dt: document.title,
			dl: document.location.origin + this.state.toString(),
			ul: (navigator.language || '').toLowerCase(),
			sr: `${(window.screen || {}).width}x${(window.screen || {}).height}`,
			vp: window.visualViewport
				? `${(window.visualViewport || {}).width}x${(window.visualViewport || {}).height}`
				: undefined,
			ec: category || undefined,
			ea: action || undefined,
			el: label || undefined,
			ev: value || undefined,
			exd: error || undefined,
			exf: fatal === undefined  || fatal === false ? 0 : 1
		};
		var params = new URLSearchParams();
		Object.keys(data).forEach((key) => {
			if (data[key] !== undefined) params.append(key, data[key]);
		});
		this.send('https://www.google-analytics.com/collect', params);
	}
	trackState(state) {
		var old = this.state;
		this.state = state;
		if (old && Page.samePath(old, state)) return;
		this.track('pageview');
	}
	trackEvent(obj) {
		this.track('event', obj);
	}
	trackException(err, fatal) {
		this.track('exception', {error: err.message, fatal: fatal});
	}
}

Page.setup(function(state) {
	if (document.body.getAttribute('block-type') != "page") {
		return;
	}
	if (!Page.analytics) Page.analytics = new GoogleAnalytics();
	var gaid = (document.querySelector('head > meta[name="ga"]') || {}).content;
	if (gaid) Page.analytics.gaid = gaid;
	state.chain('consent', function(state) {
		if (state.scope.$consent == "yes") {
			Page.analytics.start();
		} else {
			Page.analytics.stop();
		}
		Page.analytics.trackState(state);
	});
});

Page.patch(function(state) {
	if (Page.analytics) Page.analytics.trackState(state);
});

