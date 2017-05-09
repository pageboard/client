(function(exports) {

exports.header = Object.assign(exports.header || {}, {
	title: "Header",
	properties: {},
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	menu: 'layout',
	view: function(doc, block) {
		return doc.dom`<div class="ui header" block-content="content"></div>`;
	},
	stylesheets: [
		'/public/semantic-ui/components/header.css'
	]
});

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

