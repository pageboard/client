Page.setup(function(state) {
	state.finish(() => {
		var consent = Page.storage.get('consent');
		if (consent === null && !Page.getConsent || state.scope.$write) {
			consent = "yes";
		}
		state.scope.$consent = consent;
		if (consent !== null) {
			state.runChain('consent');
		} else {
			Page.getConsent(state);
		}
	});
});

