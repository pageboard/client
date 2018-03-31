Page.setup(function(state) {
	var tEndC;
	var tEnd = "transitionend";

	var transitions = {
		transition: tEnd,
		OTransition: 'oTransitionEnd',
		MozTransition: tEnd,
		msTransition: 'MSTransitionEnd',
		WebkitTransition: 'webkitTransitionEnd'
	};

	var st = document.body.style;
	for (var t in transitions) {
		if (st[t] !== undefined) tEndC = transitions[t];
	}

	if (tEndC && document.body.dataset.transition) {
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
	} else {
		return;
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
		setTimeout(function() {
			document.body.classList.add('start');
		});
		document.documentElement.addEventListener(tEnd, trDone);

		function trDone(e) {
			// only transitions of body children are considered
			if (e.target.parentNode != document.body) return;
			document.documentElement.removeEventListener(tEnd, trDone);
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

