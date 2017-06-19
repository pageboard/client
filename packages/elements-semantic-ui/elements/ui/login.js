Page.setup(function(state) {
	document.body.addEventListener('submit', function(e) {
		if (!e.target.matches('[block-type="login"]')) return;
		e.preventDefault();
		console.log("form submitted");
	});
});
