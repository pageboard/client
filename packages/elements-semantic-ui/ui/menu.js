Page.patch(function(state) {
	Array.prototype.forEach.call(
		document.querySelectorAll('.ui.menu [href]'),
		function(item) {
			if (item.getAttribute('href') && Page.sameDomain(item, state) && Page.samePath(item, state)) {
				item.classList.add('active');
			}
		}
	);
});

Page.setup(function(state) {
	var ref = document.referrer;
	if (ref) {
		ref = Page.parse(ref);
		if (ref.pathname != state.pathname) {
			var anc = document.querySelector(`a[href="${ref.pathname}"]:not(.item):not([block-type="nav"])`);
			if (anc) {
				var parent = anc.parentNode.closest('[block-id]');
				if (parent && parent.scrollIntoView) {
					parent.scrollIntoView();
					parent.focus();
				}
			}
		}
	}
});

