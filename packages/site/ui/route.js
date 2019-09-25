Page.route(function(state) {
	var loader;
	if (state.data.$cache && !state.data.$vary) {
		loader = Promise.resolve(state.data.$cache);
	} else {
		loader = Pageboard.fetch('get', '/.api/page', {
			url: state.pathname.replace(/\.\w+$/, ''),
			develop: state.query.develop
		});
	}

	return Pageboard.bundle(loader, state).then(function(res) {
		state.data.$cache = res;
		state.scope.$page = res.item;
		var node = Pageboard.render(res, state.scope);
		if (!node || node.nodeName != "BODY") {
			throw new Error("page render should return a body element");
		}
		var doc = node.ownerDocument;
		doc.replaceChild(node.parentNode, doc.documentElement);
		return doc;
	});
});

if (!Page.serialize) Page.serialize = function(state) {
	var helper = document.createElement('div');
	Array.from(document.querySelectorAll('template')).forEach((node) => {
		var dest = node.dom(`<script type="text/html"></script>`);
		helper.textContent = Array.from(node.content.childNodes).map(child => {
			if (child.nodeType == Node.TEXT_NODE) return child.nodeValue;
			else return child.outerHTML;
		}).join('');
		dest.textContent = helper.innerHTML;
		node.replaceWith(dest);
	});
	return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
};
