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
		},
		dual: {
			title: 'Dual mode',
			description: 'Display menu for showing cells as articles',
			type: "boolean",
			default: false
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
		var d = block.data;
		return doc.dom`<element-portfolio data-shape="${d.shape}" data-dual="${d.dual}">
			<div block-content="items"></div>
		</element-portfolio>`;
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
	context: "portfolio/",
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
		},
		article: {
			spec: "block+",
			title: "article"
		}
	},
	icon: '<b class="icon">Cell</b>',
	render: function(doc, block) {
		return doc.dom`<div class="item" data-scale-width="${block.data.scaleWidth}" data-scale-height="${block.data.scaleHeight}">
			<element-portfolio-image src="${block.data.url}"></element-portfolio-image>
			<div class="content">
				<div class="cell" block-content="cell"></div>
				<div class="article" block-content="article"></div>
			</div>
		</div>`;
	}
};

