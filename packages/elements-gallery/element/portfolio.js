Pageboard.elements.portfolio = {
	title: "Portfolio",
	properties: {
		shape: {
			title: 'Shape',
			oneOf: [{
				constant: "square",
				title: "Square",
			}, {
				constant: "tall",
				title: "Tall"
			}, {
				constant: "wide",
				title: "Wide"
			}],
			default: "square"
		},
		listToggle: {
			title: 'Toggle to list',
			description: 'Display a menu to switch between portfolio and list',
			type: "boolean",
			default: false
		},
		carouselToggle: {
			title: 'Toggle to carousel',
			description: 'Click on cells to switch to carousel',
			type: "boolean",
			default: true
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
	render: function(doc, block, view) {
		var d = block.data;
		return doc.dom`<element-portfolio data-shape="${d.shape}" data-list-toggle="${d.listToggle}" data-carousel-toggle="${!view.editable && d.carouselToggle}">
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

