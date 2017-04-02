(function(exports) {

var gridIcon = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="#666" d="M0 0h20v20H0z"/><path fill="#FFF" d="M2.727 5.455h3.636v2.727H2.727zM2.727 10h3.636v2.727H2.727zM2.727 14.545h3.636v2.727H2.727zM8.182 5.455h3.636v2.727H8.182zM8.182 10h3.636v2.727H8.182zM8.182 14.545h3.636v2.727H8.182zM13.636 5.455h3.636v2.727h-3.636zM13.636 10h3.636v2.727h-3.636zM13.636 14.545h3.636v2.727h-3.636z"/></g></svg>';

exports.grid = Object.assign(exports.grid || {}, {
	title: "Grid",
	properties: {},
	group: "block",
	contents: {
		columns: {
			spec: "grid_column+",
			title: 'Columns'
		}
	},
	menu: 'layout',
	icon: gridIcon
});


exports.grid_column = Object.assign(exports.grid_column || {}, {
	title: "Column",
	properties: {
		width: {
			title: 'Column width',
			description: 'Between 1 and 16, set to 0 for auto',
			type: "integer",
			default: 0,
			minimum: 0,
			maximum: 16
		}
	},
	contents: {
		content: {
			spec: "block+",
			title: 'Content'
		}
	},
	menu: 'layout',
	icon: gridIcon
});

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

