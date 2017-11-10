Pageboard.elements.portfolio = {
	title: "Portfolio",
	priority: 21,
	group: 'block',
	properties: {
		shape: {
			title: 'Shape',
			oneOf: [{
				const: "square",
				title: "Square",
			}, {
				const: "tall",
				title: "Tall"
			}, {
				const: "wide",
				title: "Wide"
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
	icon: '<i class="grid layout icon"></i>',
	render: function(doc, block, view) {
		var d = block.data;
		return doc.dom`<element-portfolio data-shape="${d.shape}">
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
				const: "1",
				title: "100%"
			}, {
				const: "2",
				title: "200%"
			}],
			default: "1"
		},
		scaleHeight: {
			title: 'Scale height',
			oneOf: [{
				const: "1",
				title: "100%"
			}, {
				const: "2",
				title: "200%"
			}],
			default: "1"
		}
	},
	contents: {
		media: {
			spec: "image",
			title: "media"
		},
		content: {
			spec: "(block|itemlink)+",
			title: "content"
		}
	},
	icon: '<i class="add icon"></i>',
	tag: 'element-portfolio-item',
	render: function(doc, block) {
		return doc.dom`<element-portfolio-item data-scale-width="${block.data.scaleWidth}" data-scale-height="${block.data.scaleHeight}">
			<div class="media" block-content="media"></div>
			<div class="content" block-content="content"></div>
		</element-portfolio-item>`;
	}
};

