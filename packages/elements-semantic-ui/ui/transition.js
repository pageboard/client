Page.updateBody = function(body, state) {
	if (!state.data.scroll) state.data.scroll = {x:0, y:0};

	var from = document.body.dataset.transitionFrom;
	var to = body.dataset.transitionTo;

	// First, store positions of current sections
	var fromRects = Array.prototype.map.call(document.body.children, function(node) {
		if (node.dataset.transitionKeep || !node.matches('[block-type="main"]')) return;
		return node.getBoundingClientRect();
	});

	// Second, add transition-from class to current sections
	var fromList = Array.prototype.map.call(document.body.children, function(node) {
		if (node.dataset.transitionKeep) {
			return;
		}
		node.classList.add('transition-from');
		return node;
	});

	// Third, insert new sections
	Page.updateAttributes(document.body, body);
	var clist = document.body.classList;
	clist.add('transition-before');


	var toList = Array.prototype.map.call(body.children, function(node) {
		node.classList.add('transition-to');
		return node;
	});
	toList.forEach(function(node) {
		document.body.appendChild(node);
	});

	function transitionEndEvent() {
		var transitions = {
			transition: "transitionend",
			OTransition: 'oTransitionEnd',
			MozTransition: "transitionend",
			msTransition: 'MSTransitionEnd',
			WebkitTransition: 'webkitTransitionEnd'
		};

		var st = document.body.style;
		for (var t in transitions) {
			if (st[t] !== undefined) {
				return transitions[t];
			}
		}
	}

	var ctx = state.transition = {
		rects: fromRects,
		fromList: fromList,
		toList: toList,
		from: from,
		to: to,
		event: transitionEndEvent()
	};
	if (ctx.event && (from || to) && !body.isContentEditable) ctx.ok = true;
};

Page.setup(function(state) {
	var scroll = state.data.scroll;
	if (scroll && (scroll.x || scroll.y)) return;
	var ref = Page.referrer;
	if (!ref) return;
	if (!Page.sameDomain(ref, state) || ref.pathname == state.pathname) return;
	var anc = document.querySelector(`a[href="${ref.pathname}"]:not(.item):not([block-type="nav"])`);
	if (!anc) return;
	var parent = anc.parentNode.closest('[block-id]');
	if (!parent) return;
	if (!state.transition || !state.transition.ok) {
		if (parent.scrollIntoView) parent.scrollIntoView();
	} else {
		state.transition.node = parent;
	}
});

Page.setup(function(state) {
	var ctx = state.transition;
	if (!ctx) return;
	var doc = document.documentElement;
	var clist = document.body.classList;
	var scroll = state.data.scroll;
	if (ctx.node) {
		var scrollX = window.scrollX;
		var scrollY = window.scrollY;
		ctx.node.scrollIntoView();
		scroll.x += window.scrollX - scrollX;
		scroll.y += window.scrollY - scrollY;
		delete ctx.node;
	}
	if (ctx.ok) {
		ctx.fromList.forEach(function(node, i) {
			var rect = ctx.rects[i];
			if (!node || !rect) return;
			Object.assign(node.style, {
				left: `${Math.round(rect.left + scroll.x)}px`,
				top: `${Math.round(rect.top + scroll.y)}px`,
				width: `${Math.round(rect.width)}px`,
				height: `${Math.round(rect.height)}px`
			});
		});

		doc.classList.add('transition');
		clist.add('transition');

		if (ctx.from) {
			clist.add(ctx.from);
		}
		if (ctx.to) {
			clist.add(ctx.to);
		}
	}
	window.scrollTo(scroll.x, scroll.y);

	clist.remove('transition-before');
	if (!ctx.ok) {
		cleanup();
		return;
	}

	ctx.safeTo = setTimeout(function() {
		console.warn("Transition timeout", from, to);
		trDone({target: {parentNode: document.body}});
	}, 3000);

	setTimeout(function() {
		document.documentElement.addEventListener(ctx.event, trDone);
		clist.add('transitioning');
	});

	function trDone(e) {
		if (ctx.safeTo) {
			clearTimeout(ctx.safeTo);
			delete ctx.safeTo;
		}
		// only transitions of body children are considered
		if (e.target.parentNode != document.body) return;
		document.documentElement.removeEventListener(ctx.event, trDone);
		setTimeout(cleanup);
	}

	function cleanup() {
		ctx.fromList.forEach(function(node) {
			if (node) node.remove();
		});
		ctx.toList.forEach(function(node) {
			node.classList.remove('transition-to');
		});
		clist.remove('transition', 'transitioning');
		doc.classList.remove('transition');
		if (ctx.from) clist.remove(ctx.from);
		if (ctx.to) clist.remove(ctx.to);
	}
});

Page.setup(function(state) {
	document.addEventListener('click', function(e) {
		var a = e.target.closest('a');
		var href = a && a.getAttribute('href');
		if (href) {
			if (e.defaultPrevented) return;
			if (document.body.isContentEditable) {
				e.preventDefault();
				return;
			}
			if (a.target) {
				return;
			} else {
				e.preventDefault();
				var obj = Page.parse(href);
				if (Page.sameDomain(obj, state) && state.query.develop) {
					obj.query.develop = state.query.develop;
				}
				Page.push(href);
			}
		}
	}, false);

	if (!document.body.isContentEditable && document.body.dataset.redirect) {
		setTimeout(function() {
			Page.replace(document.body.dataset.redirect);
		}, 10);
	}
});

window.addEventListener('scroll', Pageboard.debounce(function(e) {
	if (!Page.state || !Page.samePath(Page.state, document.location)) return;
	Page.state.data.scroll = {
		x: window.scrollX,
		y: window.scrollY
	};
	Page.historySave('replace', Page.state);
}, 500), false);

