Pageboard.elements.portfolio = {
	priority: 21,
	title: "Portfolio",
	icon: '<i class="grid layout icon"></i>',
	menu: "widget",
	group: 'block',
	properties: {
		shape: {
			title: 'Shape',
			anyOf: [{
				const: "small",
				title: "Small",
			}, {
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
	html: `<element-portfolio data-shape="[shape]">
		<div block-content="items"></div>
	</element-portfolio>`,
	stylesheets: [
		'../ui/portfolio.css'
	],
	scripts: [
		'../lib/isotope.js',
		'../ui/portfolio.js'
	]
};

Pageboard.elements.portfolio_item = {
	title: "Item",
	icon: '<i class="icons"><i class="grid layout icon"></i><i class="corner add icon"></i></i>',
	menu: "widget",
	context: "portfolio/",
	properties: {
		scaleWidth: {
			title: 'Scale width',
			anyOf: [{
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
			anyOf: [{
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
	tag: 'element-portfolio-item',
	html: `<element-portfolio-item data-scale-width="[scaleWidth]" data-scale-height="[scaleHeight]">
		<div class="media" block-content="media"></div>
		<div class="content" block-content="content"></div>
	</element-portfolio-item>`
};

