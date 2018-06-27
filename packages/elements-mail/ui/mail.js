Page.build(function(state) {
	Page.patch(function(state) {
		if (document.body.isContentEditable) return;
		Array.from(document.querySelectorAll('script')).forEach(function(node) {
			node.remove();
		});
		Array.from(document.querySelectorAll('element-query')).forEach(function(node) {
			var tp = node.querySelector('[block-content="template"]');
			if (tp) tp.remove();
			var results = node.querySelector('.results');
			while (results.firstChild) node.parentNode.insertBefore(results.firstChild, node);
			node.remove();
		});
		var dloc = document.location;
		var base = dloc.protocol + '//' + dloc.host;
		function absolut(selector, att) {
			var list = document.querySelectorAll(selector);
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
		var md = (new Europa()).convert(document.documentElement);
		return inlineresources.loadAndInlineCssLinks(document, {}).then(function(errors) {
			Array.from(document.querySelectorAll('[block-id]')).forEach(function(node) {
				node.removeAttribute('block-id');
			});
			var html = Juice(document.documentElement.outerHTML);
			document.errors = errors;
			document.text = md;
			document.html = '<!DOCTYPE html>\n' + html;
		});
	});
});
