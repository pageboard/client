Page.setup(function(state) {
	state.finish(function() {
		Array.from(document.querySelectorAll('element-image')).forEach(function(node) {
			node.reveal(true);
		});
	});
});
