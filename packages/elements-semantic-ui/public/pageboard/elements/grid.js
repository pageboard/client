(function(exports) {

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
	icon: '<i class="icon grid layout"></i>',
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
	icon: '<i class="icon columns"></i>',
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

