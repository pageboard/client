Pageboard.elements.portfolio = {
	title: "Portfolio",
	properties: {
		shape: {
			title: 'Shape',
			oneOf: [{
				constant: "square",
				title: "Square",
			}, {
				constant: "rectangle",
				title: "Rectangle"
			}],
			default: "square"
		}
	},
	contents: {
		items: {
			spec: "portfolio_item+",
			title: 'items'
		}
	},
	group: 'block',
	icon: '<b class="icon">Por</b>',
	render: function(doc, block) {
		return doc.dom`<element-portfolio block-content="items" data-shape="${block.data.shape}"></element-portfolio>`;
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
		scaleWidth: {
			title: 'Scale width',
			oneOf: [{
				constant: "1",
				title: "100%"
			}, {
				constant: "2",
				title: "200%"
			}],
			default: "1"
		},
		scaleHeight: {
			title: 'Scale height',
			oneOf: [{
				constant: "1",
				title: "100%"
			}, {
				constant: "2",
				title: "200%"
			}],
			default: "1"
		},
		url: {
			title: 'Image',
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				filter: {
					type: ["image", "svg"]
				}
			}
		}
	},
	contents: {
		cell: {
			spec: "layout",
			title: "cell"
		}
	},
	icon: '<b class="icon">Cell</b>',
	render: function(doc, block) {
		return doc.dom`<div class="portfolio item" data-scale-width="${block.data.scaleWidth}" data-scale-height="${block.data.scaleHeight}">
			<element-portfolio-image src="${block.data.url}"></element-portfolio-image>
			<div class="portfolio cell" block-content="cell"></div>
		</div>`;
	}
};

