window.dataLayer = window.dataLayer || [];
Page.setup(function(state) {
	state.chain('dnt', function(state) {
		if (state.userStorage.get('dnt') != "no") {
			window.dataLayer = [];
			state.userStorage.clearCookies(/^_g/);
			return;
		}
		if (!window.dataLayer.length) window.dataLayer.push({
			'gtm.start': new Date().getTime(),
			event:'gtm.js',
			anonymize_ip: true
		});
	});
});

