Page.patch(function(state) {
	state.finish(function() {
		Array.prototype.forEach.call(
			document.querySelectorAll('.ui.menu [href]'),
			function(item) {
				var loc = item.getAttribute('href');
				if (loc) {
					loc = Page.parse(loc);
					loc.query.develop = state.query.develop;
					if (Page.samePath(loc, state)) {
						item.classList.add('active');
					}
				}
			}
		);
	});
});

class HTMLElementMenu extends HTMLCustomElement {
	prepare() {
		let dropdown = this.lastElementChild;
		if (!dropdown || !dropdown.matches('.dropdown')) {

		}
	}
	setup(state) {

	}
	close(state) {

	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-menu', HTMLElementMenu);
});
