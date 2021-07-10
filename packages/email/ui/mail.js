Page.serialize = function() {
	const doc = document;
	doc.querySelectorAll('script').forEach(function(node) {
		node.remove();
	});
	doc.querySelectorAll('element-template').forEach(function(node) {
		const template = node.firstElementChild;
		const view = node.lastElementChild;
		template.remove();
		while (view.firstChild) node.parentNode.insertBefore(view.firstChild, node);
		node.remove();
	});
	const dloc = doc.location;
	const base = dloc.protocol + '//' + dloc.host;
	function absolut(selector, att) {
		doc.querySelectorAll(selector).forEach((node) => {
			const item = node.attributes.getNamedItem(att);
			if (!item) return;
			const uloc = new URL(item.nodeValue, base);
			item.nodeValue = uloc.href;
		});
	}
	absolut('a', 'href');
	doc.querySelectorAll('img[is]').forEach(function(node) {
		const img = doc.createElement('img');
		img.srcset = node.srcset;
		img.src = node.src;
		img.alt = node.alt;
		node.parentNode.replaceChild(img, node);
	});

	const md = (new window.Europa()).convert(doc.documentElement);
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
