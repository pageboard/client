(function(exports) {

var gridIcon = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="#666" d="M0 0h20v20H0z"/><path fill="#FFF" d="M2.727 5.455h3.636v2.727H2.727zM2.727 10h3.636v2.727H2.727zM2.727 14.545h3.636v2.727H2.727zM8.182 5.455h3.636v2.727H8.182zM8.182 10h3.636v2.727H8.182zM8.182 14.545h3.636v2.727H8.182zM13.636 5.455h3.636v2.727h-3.636zM13.636 10h3.636v2.727h-3.636zM13.636 14.545h3.636v2.727h-3.636z"/></g></svg>';

exports.grid = {
	title: "Grid",
	properties: {},
	group: "block",
	contents: {
		header: {
			spec: "text*",
			title: "header"
		},
		columns: {
			spec: "grid_column+",
			title: 'columns'
		}
	},
	menu: 'layout',
	icon: gridIcon,
	view: function(doc, block) {
		return doc.dom`<div>
			<div class="ui header" block-content="header"></div>
			<div class="ui doubling stackable equal width grid" block-content="columns"></div>
		</div>`;
	},
	stylesheets: [
		'/public/semantic-ui/components/grid.css',
		'/public/semantic-ui/components/header.css'
	]
};


exports.grid_column = {
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
			title: 'content'
		}
	},
	menu: 'layout',
	icon: gridIcon,
	view: function(doc, block) {
		var prefix = '';
		if (block.data.width != null) prefix = {
			0: '',
			1: 'one',
			2: 'two',
			3: 'three',
			4: 'four',
			5: 'five',
			6: 'six',
			7: 'seven',
			8: 'eight',
			9: 'nine',
			10: 'ten',
			11: 'eleven',
			12: 'twelve',
			13: 'thirteen',
			14: 'fourteen',
			15: 'fifteen',
			16: 'sixteen'
		}[block.data.width];
		if (prefix) prefix += " wide ";
		return doc.dom`<div class="${prefix} column" block-content="content"></div>`;
	}
};

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

