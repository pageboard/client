Page.build(function(state) {
	Array.prototype.forEach.call(
		document.querySelectorAll('.ui.menu [href]'),
		function(item) {
			if (item.getAttribute('href') && Page.sameDomain(item, state) && Page.samePath(item, state)) {
				item.classList.add('active');
			}
		}
	);
});
