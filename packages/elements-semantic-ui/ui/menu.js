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
	document.addEventListener('click', function(e) {
		var a = e.target.closest('a');
		var href = a && a.getAttribute('href');
		if (href) {
			e.preventDefault();
			if (!document.body.contentEditable) Page.push(href);
		}
	}, false);
});
