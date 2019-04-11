Page.patch(function(state) {
	Array.prototype.forEach.call(
		document.querySelectorAll('.ui.menu [href]'),
		function(item) {
			if (item.getAttribute('href') && Page.sameDomain(item, state) && Page.samePath(item, state)) {
				item.classList.add('active');
				var ancestor = item;
				var title;
				while ((ancestor = ancestor.parentNode.closest('.item'))) {
					title = ancestor.firstElementChild;
					if (title && title.matches('.title')) title.classList.add('active');
				}
			}
		}
	);
});

