
Page.paint(state => {
	state.revealAll();
});
Page.constructor.serialize = function (state, type) {
	const doc = document;
	for (const node of doc.querySelectorAll('element-template')) {
		const template = node.firstElementChild;
		const view = template.nextElementSibling;
		while (view.firstChild) node.parentNode.insertBefore(view.firstChild, node);
		node.remove();
	}
	const dloc = doc.location;
	const base = dloc.protocol + '//' + dloc.host;
	function absolut(selector, att) {
		for (const node of doc.querySelectorAll(selector)) {
			const item = node.attributes.getNamedItem(att);
			if (!item) continue;
			const uloc = new URL(item.nodeValue, base);
			item.nodeValue = uloc.href;
		}
	}
	absolut('a', 'href');
	for (const node of doc.querySelectorAll('img[is]')) {
		const img = doc.createElement('img');
		if (node.srcset) img.srcset = node.srcset;
		if (node.src) img.src = node.src;
		if (node.alt) img.alt = node.alt;
		img.setAttribute('style', node.getAttribute('style'));
		node.parentNode.replaceChild(img, node);
	}

	if (type == "html") {
		// previsualize email
		return {
			mime: 'text/html',
			body: '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
		};
	}
	for (const node of doc.querySelectorAll('script')) {
		node.remove();
	}

	const attachments = [];
	for (const node of doc.querySelectorAll('a[download]')) {
		attachments.push({
			filename: node.download,
			href: node.href
		});
		node.remove();
	}
	const md = (new Pageboard.Europa()).convert(doc.documentElement.cloneNode(true));
	return {
		mime: "application/json",
		body: JSON.stringify({
			title: doc.title,
			text: md,
			html: '<!DOCTYPE html>\n' + doc.documentElement.outerHTML,
			attachments
		})
	};
};
