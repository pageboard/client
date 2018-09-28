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

Page.patch(function(state) {
	var scroll = state.data.scroll;
	if (scroll && (scroll.x || scroll.y)) return;
	var ref = Page.referrer;
	if (!ref) return;
	if (!Page.sameDomain(ref, state) || ref.pathname == state.pathname) return;
	var anc = document.querySelector(`a[href="${ref.pathname}"]:not(.item):not([block-type="nav"])`);
	if (!anc) return;
	var parent = anc.parentNode.closest('[block-id]');
	if (!parent) return;
	if (!state.transition) {
		if (parent.scrollIntoView) parent.scrollIntoView();
	} else {
		scroll.node = parent;
	}
});

