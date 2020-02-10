Page.setup(function(state) {
	state.finish(() => {
		var consent = Page.storage.get('consent');
		if (consent === null && !Page.consent) {
			consent = "yes";
		}
		state.scope.$consent = consent;
		if (consent !== null) {
			state.runChain('consent');
		}
	});
});

