Page.setup(function(state) {
	if (document.body.dataset.transition) {
		document.body.addEventListener('click', function(e) {
			var a = e.target.closest('a');
			var href = a && a.getAttribute('href');
			if (href) {
				e.preventDefault();
				if (!document.body.isContentEditable) {
					Page.push(href);
				}
			}
		}, false);
	}
	
	Page.updateBody = function(body) {
		var transition = document.body.dataset.transition;
		if (!transition) {
			return body;
		}
		Page.updateAttributes(document.body, body);
		document.body.classList.add('transition', transition);
		var fromList = Array.prototype.map.call(document.body.children, function(node) {
			node.classList.add('transition-from');
			return node;
		});
		var toList = Array.prototype.map.call(body.children, function(node) {
			node.classList.add('transition-to');
			return node;
		});
		toList.forEach(function(node) {
			document.body.appendChild(node);
		});
		document.body.addEventListener('transitionend', trDone);
 		document.body.classList.add('start');

		function trDone(e) {
			// assume first transition of body child
			if (e.target.parentNode != document.body) return;
			document.body.removeEventListener('transitionend', trDone);
			fromList.forEach(function(node) {
				node.remove();
			});
			toList.forEach(function(node) {
				node.classList.remove('transition-to');
			});
			document.body.classList.remove('transition', 'start', transition);
		}
	};
});
