exports.carousel = {
	priority: 21,
	title: "Carousel",
	icon: '<i class="image icon"></i>',
	menu: "widget",
	group: 'block',
	bundle: 'gallery',
	properties: {
		name: {
			title: 'Name',
			type: 'string',
			format: 'id',
			nullable: true
		},
		autoPlay: {
			title: 'Autoplay delay',
			description: 'Autoplay delay in seconds, 0 to disable',
			type: 'number',
			minimum: 0,
			maximum: 999, /* effectively giving a smaller width to the input */
			default: 3
		},
		width: {
			title: 'Cell width',
			description: 'in %, use 0 for auto',
			type: 'number',
			minimum: 0,
			maximum: 100,
			default: 100
		},
		height: {
			title: 'Height',
			description: 'use 0 for auto',
			type: 'number',
			minimum: 0,
			default: 0
		},
		heightUnits: {
			title: 'Height units',
			default: 'em',
			anyOf: [{
				title: 'em',
				const: 'em'
			}, {
				title: 'rem',
				const: 'rem'
			}, {
				title: 'px',
				const: 'px'
			}, {
				title: 'vh',
				const: 'vh'
			}, {
				title: '%',
				const: '%'
			}]
		},
		pageDots: {
			title: 'Page dots',
			description: 'Show page dots',
			type: 'boolean',
			default: false,
		},
		prevNextButtons: {
			title: 'Navigation buttons',
			type: 'boolean',
			default: true
		},
		fullview: {
			title: 'Full view',
			type: 'boolean',
			default: false
		},
		fullviewButton: {
			title: 'Full view button',
			type: 'boolean',
			default: false
		},
		groupCells: {
			title: 'Group cells',
			type: 'boolean',
			default: false
		},
		wrapAround: {
			title: 'Wrap around',
			type: 'boolean',
			default: false
		},
		fade: {
			title: 'Fade transition',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		id: "items",
		nodes: "carousel_item+"
	},
	html: `<element-carousel id="[name|as:xid]"
		data-width="[width]" data-height="[height|fail:][heightUnits]"
		data-auto-play="[autoPlay]" data-page-dots="[pageDots]"
		data-prev-next-buttons="[prevNextButtons]" data-fullview-button="[fullviewButton]" data-fullview="[fullview]"
		data-group-cells="[groupCells]" data-wrap-around="[wrapAround]" data-fade="[fade]"
	>
		<div class="flickity-viewport">
			<div class="flickity-slider" block-content="items"></div>
		</div>
		<a class="ui icon button fullview"><i class="expand icon"></i><i class="close icon"></i></a>
	</element-carousel>`,
	stylesheets: [
		'../lib/flickity.css',
		'../ui/carousel.css'
	],
	scripts: [
		'../lib/carousel.js'
	]
};

exports.carousel_item = {
	title: "Cell",
	icon: '<i class="icons"><i class="image icon"></i><i class="corner add icon"></i></i>',
	menu: "widget",
	contents: [{
		id: 'media',
		nodes: "image|video",
		title: "media"
	}, {
		id: 'content',
		nodes: "(block|itemlink)+",
		title: "content"
	}],
	context: 'carousel/',
	html: `<element-carousel-cell>
		<div class="media" block-content="media"></div>
		<div class="content" block-content="content"></div>
	</element-carousel-cell>`
};

