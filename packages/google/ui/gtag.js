window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

Page.connect(new class {
	constructor() {
		const node = document.head.querySelector('script[src^="https://www.googletagmanager.com"]');
		if (!node) return;
		var obj = Page.parse(node.src);
		this.type = obj.pathname.startsWith('/gtm') ? 'gtm' : 'gtag';
		this.id = obj.query.id;
	}
	consent(state) {
		if (!this.id) return;
		var agreed = state.scope.$consent == "yes";
		window['ga-disable-' + this.id] = !agreed;
		this[this.type](agreed, state);
	}
	gtm(agreed, state) {
		if (!agreed) {
			Page.storage.clearCookies(/^_g/);
		} else if (!this.started) {
			this.started = true;
			gtag({
				'gtm.start': new Date().getTime(),
				event: 'gtm.js',
				anonymize_ip: true
			});
		}
	}
	gtag(agreed, state) {
		var val = agreed ? 'granted' : 'denied';
		var opts = {
			ad_storage: val,
			analytics_storage: val
		};
		if (!this.started) {
			this.started = true;
			gtag('consent', 'default', opts);
			gtag('js', new Date());
		} else {
			gtag('consent', 'update', opts);
		}
		gtag('config', this.id, { page_path: state.toString() });
	}
	paint(state) {
		if (this.id) state.consent(this);
	}
});
