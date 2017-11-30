Pageboard.elements.carousel = {
	title: "Carousel",
	menu: "widget",
	priority: 21,
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
			multipleOf: 5,
			default: 100
		},
		height: {
			title: 'Cell height',
			description: 'Cell height in vh - 0 for auto',
			type: 'number',
			minimum: 0,
			maximum: 999,
			multipleOf: 10,
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
		}
	},
	contents: {
		items: {
			spec: "carousel_item+",
			title: 'cells'
		}
	},
	icon: '<i class="image icon"></i>',
	tag: 'element-carousel',
	render: function(doc, block, view) {
		var d = block.data;
		var node = doc.dom`<element-carousel data-page-dots="${d.pageDots}" data-auto-play="${view.editable ? 0 : d.autoPlay}" data-draggable="${!view.editable}" data-prev-next-buttons="${d.prevNextButtons}" data-width="${d.width || 'auto'}" data-height="${d.height || 'auto'}">
			<div class="flickity-viewport">
				<div class="flickity-slider" block-content="items"></div>
			</div>
		</element-carousel>`;
		return node;
	},
	stylesheets: [
		'../ui/flickity.css',
		'../ui/carousel.css'
	],
	scripts: [
		'../ui/flickity.js',
		'../ui/carousel.js'
	]
};

Pageboard.elements.carousel_item = {
	title: "Cell",
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
	icon: '<i class="add icon"></i>',
	context: 'carousel/',
	tag: 'element-carousel-cell',
	render: function(doc, block) {
		return doc.dom`<element-carousel-cell>
			<div class="media" block-content="media"></div>
			<div class="content" block-content="content"></div>
		</element-carousel-cell>`;
	}
};

