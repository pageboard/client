window.dataLayer = window.dataLayer || [];
Page.setup(function(state) {
	if (document.getElementById('gtm'))	state.consent(function(agreed) {
		if (!agreed) {
			window.dataLayer = [];
			Page.storage.clearCookies(/^_g/);
		} else if (!window.dataLayer.length) window.dataLayer.push({
			'gtm.start': new Date().getTime(),
			event:'gtm.js',
			anonymize_ip: true
		});
	});
});

