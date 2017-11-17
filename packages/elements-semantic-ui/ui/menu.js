Page.build(function(state) {
	Array.prototype.forEach.call(
		document.querySelectorAll('.ui.menu [href]'),
		function(item) {
			if (Page.sameDomain(item, state) && Page.samePath(item, state)) {
				item.classList.add('active');
			}
		}
	);
});
