Page.patch(function(state) {
	Array.prototype.forEach.call(
		document.querySelectorAll('.ui.menu [href]'),
		function(item) {
			var loc = item.getAttribute('href');
			if (loc) {
				loc = Page.parse(loc);
				if (state.query.develop !== undefined) loc.query.develop = state.query.develop;
				if (Page.samePath(loc, state)) {
					item.classList.add('active');
				}
			}
		}
	);
});

