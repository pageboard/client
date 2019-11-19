(function() {
const GA = {
	config: {
		anonymize_ip: true
	}
};
window.dataLayer = window.dataLayer || [];
function gtag() {
	window.dataLayer.push(arguments);
}
Page.setup(function(state) {
	if (!GA.id) {
		var node = document.head.querySelector('script[src^="https://www.googletagmanager.com/gtag/js"]');
		if (!node) return;
		GA.id = Page.parse(node.src).query.id;
	}
	if (!GA.id) return;
	state.chain('dnt', function(state) {
		if (state.userStorage.get('dnt') != "no") {
			window.dataLayer = [];
			state.userStorage.clearCookies(/^_ga/);
		} else {
			if (!GA.first) {
				gtag('js', new Date());
				gtag('config', GA.id, GA.config);
				GA.first = true;
			} else state.finish(function() {
				gtag('config', GA.id, Object.assign({
					page_path: Page.format(state)
				}, GA.config));
			});
		}
	});
});
})();
