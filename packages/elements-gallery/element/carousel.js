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
		var node = doc.dom`<element-carousel>
			<div class="flickity-viewport">
				<div class="flickity-slider" block-content="items"></div>
			</div>
		</element-carousel>`;
		var opts = Object.assign({}, d);
		if (view.editable) {
			opts.autoPlay = 0;
			opts.draggable = false;
			opts.wrapAround = false;
		}
		if (!opts.width) opts.width = 'auto';
		if (!opts.height) opts.height = 'auto';
		Object.assign(node.dataset, opts);
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

