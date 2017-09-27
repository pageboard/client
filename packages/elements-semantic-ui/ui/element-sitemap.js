class HTMLElementSitepage extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		var node = this;
		var url = node.dataset.url || "";
		var name = url.substring(1).split('/').pop();
		// collect all parent element-sitepage
		var parent = node.parentNode && node.parentNode.closest('element-sitepage');
		var parentUrl = parent ? parent.dataset.url : '';
		var newUrl = parentUrl + '/' + name;
		if (url == newUrl) return;
		// the mutations observer kicks in after this callback
		setTimeout(function() {
			Array.prototype.forEach.call(node.querySelectorAll('element-sitepage'), function(child) {
				var childUrl = child.dataset.url;
				if (childUrl.startsWith(url)) {
					childUrl = newUrl + childUrl.substring(url.length);
					child.setAttribute('data-url', childUrl);
				}
			});
			node.setAttribute('data-url', newUrl);
		});
	}
}

Page.setup(function() {
	window.customElements.define('element-sitepage', HTMLElementSitepage);
});
