Pageboard.elements.polyfill = {
	priority: -101, // before page
	url: 'https://cdn.polyfill.io/v2/polyfill.min.js',
	install: function(doc, page) {
		var map = {};
		Object.keys(Pageboard.elements).forEach(function(key) {
			var list = Pageboard.elements[key].polyfills;
			if (!list) return;
			if (typeof list == "string") list = [list];
			list.forEach(function(item) {
				map[item] = true;
			});
		});
		var features = Object.keys(map).join(',');
		if (features) {
			Pageboard.elements[page.type].scripts.unshift(`${this.url}?flags=gated&features=${features}`);
		}
	},
	polyfills: 'default'
};

