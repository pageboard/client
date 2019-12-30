Page.setup(function(state) {
	var consent = Page.storage.get('consent');
	if (consent === null && !Page.consent) {
		consent = "yes";
	}
	state.scope.$consent = consent;
	if (consent !== null) {
		state.runChain('consent');
	}
});

