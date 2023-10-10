exports.portfolio = {
	priority: 21,
	title: "Portfolio",
	icon: '<i class="grid layout icon"></i>',
	menu: "widget",
	bundle: 'gallery',
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
		id: 'items',
		nodes: "portfolio_item+"
	},
	html: `<div data-shape="[shape]" block-content="items"></div>`,
	stylesheets: [
		'../ui/portfolio.css'
	]
};

exports.portfolio_item = {
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
	contents: [{
		id: 'media',
		nodes: "image",
		title: "media"
	}, {
		id: 'content',
		nodes: "(block|itemlink)+",
		title: "content"
	}],
	html: `<div data-scale-width="[scaleWidth]" data-scale-height="[scaleHeight]">
		<div class="media" block-content="media"></div>
		<div class="content" block-content="content"></div>
	</div>`
};

