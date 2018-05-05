(function() {
	var list = ['init', 'route', 'build', 'patch', 'setup', 'close', 'error'];
	var tokens = document.documentElement.classList;
	function pageListener(e) {
		if (!Page.state) return;
		var cur = e.type.substring(4);
		tokens.add(cur);
		list.forEach(function(name) {
			if (name != cur) tokens.remove(name);
		});
		if (cur == "setup") {
			setTimeout(function() {
				tokens.remove('setup');
			}, 400);
		}
	}
	list.forEach(function(name) {
		window.addEventListener(`page${name}`, pageListener);
	});
})();

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

	if (tEndC) {
		document.body.addEventListener('click', function(e) {
			var a = e.target.closest('a');
			var href = a && a.getAttribute('href');
			if (href) {
				if (document.body.isContentEditable) {
					e.preventDefault();
					return;
				}
				if (a.target == "_blank") {
					return;
				} else {
					e.preventDefault();
					Page.push(href);
				}
			}
		}, false);
	} else {
		return;
	}

	Page.updateBody = function(body) {
		var from = document.body.dataset.transitionFrom;
		var to = body.dataset.transitionTo;
		if (!from && !to) {
			return body;
		}
		Page.updateAttributes(document.body, body);
		var clist = document.body.classList;
		clist.add('transition');
		if (to) {
			to = to + "-to";
			clist.add(to);
		}
		if (from) {
			from = from + "-from";
			clist.add(from);
		}
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
			clist.add('transitioning');
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
			clist.remove('transition', 'transitioning');
			if (from) clist.remove(from);
			if (to) clist.remove(to);
		}
	};
});

