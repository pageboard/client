Pageboard.elements.polyfill = {
	group: "block",
	html: '<script defer src="https://cdn.polyfill.io/v2/polyfill.min.js?flags=gated&features=[features|url]"></script>',
	install: function(scope) {
		var map = {};
		Object.keys(scope.$elements).forEach(function(key) {
			var list = scope.$elements[key].polyfills;
			if (!list) return;
			if (typeof list == "string") list = [list];
			list.forEach(function(item) {
				map[item] = true;
			});
		});
		scope.$element.dom.querySelector('head > script').before(this.dom.fuse({
			features: Object.keys(map).join(',')
		}));
	},
	polyfills: 'default'
};

