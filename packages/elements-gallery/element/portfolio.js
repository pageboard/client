Pageboard.elements.portfolio = {
	title: "Portfolio",
	properties: {
		numCols: {
			title: 'Number of columns',
			description: 'Number of unit columns per row',
			type: 'number',
			minimum: 1,
			maximum: 5,
			default: 4
		}
	},
	contents: {
		items: {
			spec: "portfolio_item*",
			title: 'items'
		}
	},
	group: 'block',
	icon: '<b class="icon">Por</b>',
	render: function(doc, block, view) {
		var num = ["", "one", "two", "three", "four", "five"][block.data.numCols];
		if (num) num += " wide";
		return doc.dom`<element-portfolio class="${num}" block-content="items"></element-portfolio>`;
	},
	stylesheets: [
		'../ui/portfolio.css'
	],
	scripts: [
		'../ui/isotope.js',
		'../ui/portfolio.js'
	]
};

Pageboard.elements.portfolio_item = {
	title: "Item",
	properties: {
		ratio: {
			title: 'Ratio',
			description: 'Cell ratio',
			oneOf: [{
				constant: "one-one",
				title: "1:1"
			}, {
				constant: "one-two",
				title: "1:2"
			}, {
				constant: "two-one",
				title: "2:1"
			}, {
				constant: "two-two",
				title: "2:2"
			}],
			default: "one-one"
		}
	},
	contents: {
		cell: {
			spec: "block+",
			title: "cell"
		}
	},
	icon: '<b class="icon">Cell</b>',
	render: function(doc, block) {
		return doc.dom`<div block-content="cell" class="item ${block.data.ratio}"></div>`;
	}
};

