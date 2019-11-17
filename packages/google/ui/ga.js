(function() {
var GA_ID;
window.dataLayer = window.dataLayer || [];
function gtag() {
	window.dataLayer.push(arguments);
}
Page.setup(function(state) {
	state.chain('dnt', function(state) {
		if (state.userStorage.get('dnt') != "no") {
			window.dataLayer = [];
			state.userStorage.clearCookies(/^_ga/);
			return;
		}
		if (!GA_ID) {
			gtag('js', new Date());
			var node = document.head.querySelector('script[src^="https://www.googletagmanager.com/gtag/js"]');
			if (!node) return;
			GA_ID = Page.parse(node.src).query.id;
			if (!GA_ID) return;
			gtag('config', GA_ID);
		} else state.finish(function() {
			gtag('config', GA_ID, {
				page_path: Page.format(state)
			});
		});
	});
});
})();
