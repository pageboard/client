Page.build(function(state) {
	Array.prototype.forEach.call(
		document.querySelectorAll('.ui.menu [href]'),
		function(item) {
			if (item.host == state.host && item.pathname == state.pathname) {
				item.classList.add('active');
			}
		}
	);
});
