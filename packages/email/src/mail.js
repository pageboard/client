import Europa from 'europa';
import { loadAndInlineCssLinks } from 'inlineresources';
import { default as Juice } from 'juice';


Page.constructor.serialize = function () {
	const doc = document;
	for (const node of doc.querySelectorAll('script')) {
		node.remove();
	}
	for (const node of doc.querySelectorAll('element-template')) {
		const template = node.firstElementChild;
		const view = node.lastElementChild;
		template.remove();
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
		img.srcset = node.srcset;
		img.src = node.src;
		img.alt = node.alt;
		node.parentNode.replaceChild(img, node);
	}

	const attachments = [];
	for (const node of doc.querySelectorAll('a[download]')) {
		attachments.push({
			filename: node.download,
			href: node.href
		});
		node.remove();
	}

	const md = (new Europa()).convert(doc.documentElement.cloneNode(true));
	return loadAndInlineCssLinks(doc, {}).then(errors => {
		return {
			mime: "application/json",
			body: JSON.stringify({
				errors,
				title: doc.title,
				text: md,
				html: '<!DOCTYPE html>\n' + Juice(doc.documentElement.outerHTML),
				attachments
			})
		};
	});
};
