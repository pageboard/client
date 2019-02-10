Page.patch(function(state) {
	if (state.query.email != "true" || document.body.isContentEditable) return;
	state.vars.email = true;
	state.finish(function(state) {
		Array.from(document.querySelectorAll('script')).forEach(function(node) {
			node.remove();
		});
		Array.from(document.querySelectorAll('element-template')).forEach(function(node) {
			var template = node.firstElementChild;
			var view = node.lastElementChild;
			template.remove();
			while (view.firstChild) node.parentNode.insertBefore(view.firstChild, node);
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
		var md = (new window.Europa()).convert(document.documentElement);
		return window.inlineresources.loadAndInlineCssLinks(document, {}).then(function(errors) {
			Array.from(document.querySelectorAll('[block-id]')).forEach(function(node) {
				node.removeAttribute('block-id');
			});
			var html = window.Juice(document.documentElement.outerHTML);
			document.errors = errors;
			document.text = md;
			document.html = '<!DOCTYPE html>\n' + html;
		});
	});
});
