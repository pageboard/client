(function(exports) {

exports.header = Object.assign(exports.header || {}, {
	title: "Header",
	properties: {},
	contents: {
		content: {
			spec: "block+",
			title: 'Content'
		}
	},
	menu: 'layout'
});

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

