window.dataLayer = window.dataLayer || [];
Page.setup(function(state) {
	state.chain('consent', function(state) {
		if (state.scope.$consent == "no") {
			window.dataLayer = [];
			Page.storage.clearCookies(/^_g/);
			return;
		}
		if (!window.dataLayer.length) window.dataLayer.push({
			'gtm.start': new Date().getTime(),
			event:'gtm.js',
			anonymize_ip: true
		});
	});
});

