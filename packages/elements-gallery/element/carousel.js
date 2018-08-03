Pageboard.elements.carousel = {
	priority: 21,
	title: "Carousel",
	icon: '<i class="image icon"></i>',
	menu: "widget",
	group: 'block',
	properties: {
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
			description: 'Cell width in % - 0 for auto',
			type: 'number',
			minimum: 0,
			maximum: 100,
			default: 100
		},
		height: {
			title: 'Cell height',
			description: 'Cell height in vh - 0 for auto',
			type: 'number',
			minimum: 0,
			maximum: 999,
			default: 0
		},
		pageDots: {
			title: 'Page dots',
			description: 'Show page dots',
			type: 'boolean',
			default: true,
		},
		prevNextButtons: {
			title: 'Prev and next buttons',
			type: 'boolean',
			default: true
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
		items: {
			spec: "carousel_item+",
			title: 'cells'
		}
	},
	tag: 'element-carousel',
	html: `<element-carousel
		data-width="[width|or:auto]" data-height="[height|or:auto]"
		data-auto-play="[autoPlay]" data-page-dots="[pageDots]"
		data-prev-next-buttons="[prevNextButtons]" data-full-view-button="[fullviewButton]"
		data-group-cells="[groupCells]" data-wrap-around="[wrapAround]" data-fade="[fade]"
	>
		<div class="flickity-viewport">
			<div class="flickity-slider" block-content="items"></div>
		</div>
	</element-carousel>`,
	stylesheets: [
		'../ui/lib/flickity.css',
		'../ui/carousel.css'
	],
	scripts: [
		'../ui/lib/flickity.js',
		'../ui/carousel.js'
	]
};

Pageboard.elements.carousel_item = {
	title: "Cell",
	icon: '<i class="icons"><i class="image icon"></i><i class="corner add icon"></i></i>',
	menu: "widget",
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
	context: 'carousel/',
	tag: 'element-carousel-cell',
	html: `<element-carousel-cell>
		<div class="media" block-content="media"></div>
		<div class="content" block-content="content"></div>
	</element-carousel-cell>`
};

