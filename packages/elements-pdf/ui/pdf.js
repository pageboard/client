Page.setup(function(state) {
	Array.from(document.querySelectorAll('element-image')).forEach(function(node) {
		node.reveal(true);
	});
});
