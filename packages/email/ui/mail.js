Page.serialize = function() {
	var doc = document;
	Array.from(doc.querySelectorAll('script')).forEach(function(node) {
		node.remove();
	});
	Array.from(doc.querySelectorAll('element-template')).forEach(function(node) {
		var template = node.firstElementChild;
		var view = node.lastElementChild;
		template.remove();
		while (view.firstChild) node.parentNode.insertBefore(view.firstChild, node);
		node.remove();
	});
	var dloc = doc.location;
	var base = dloc.protocol + '//' + dloc.host;
	function absolut(selector, att) {
		var list = doc.querySelectorAll(selector);
		var node;
		for (var i=0; i < list.length; i++) {
			node = list.item(i);
			var item = node.attributes.getNamedItem(att);
			if (!item) continue;
			var uloc = new URL(item.nodeValue, base);
			item.nodeValue = uloc.href;
		}
	}
	absolut('a', 'href');
	absolut('img', 'src');
	var md = (new window.Europa()).convert(doc.documentElement);
	return window.inlineresources.loadAndInlineCssLinks(doc, {}).then(function(errors) {
		return {
			mime: "application/json",
			body: JSON.stringify({
				errors,
				title: doc.title,
				text: md,
				html: '<!DOCTYPE html>\n' + window.Juice(doc.documentElement.outerHTML)
			})
		};
	});
};
