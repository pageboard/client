Page.patch(function(state) {
	Array.prototype.forEach.call(
		document.querySelectorAll('.ui.menu [href]'),
		function(item) {
			if (item.getAttribute('href') && Page.samePath(item, state)) {
				item.classList.add('active');
			}
		}
	);
});

