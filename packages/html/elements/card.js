exports.cards = {
	title: "Cards",
	menu: 'widget',
	icon: '<i class="icon address card outline"></i>',
	group: "block",
	contents: "(card|cardlink)+",
	properties: {
		columns: {
			title: 'Column count',
			description: 'How many cards should exist in a row\nzero for unknown',
			type: 'integer',
			minimum: 0,
			default: 0
		},
		shape: {
			title: 'Shape',
			anyOf: [{
				const: null,
				title: 'Default',
			}, {
				const: "square",
				title: "Square",
			}, {
				const: "tall",
				title: "Tall"
			}, {
				const: "wide",
				title: "Wide"
			}]
		},
		responsive: {
			title: 'Responsive',
			anyOf: [{
				title: 'No',
				const: null
			}, {
				title: 'Stackable',
				const: 'stackable'
			}, {
				title: 'Doubling',
				const: 'doubling'
			}],
			default: 'stackable'
		}
	},
	html: '<div class="ui [columns|as:colnums] [shape] [responsive] cards"></div>',
	stylesheets: [
		'../ui/card.css'
	]
};


exports.card = {
	title: "Card",
	menu: 'widget',
	icon: '<i class="icons"><i class="address card outline icon"></i><i class="corner add icon"></i></i>',
	properties: {
		fluid: {
			title: 'Fluid',
			description: 'Takes up the width of its container',
			type: 'boolean',
			default: false
		},
		centered: {
			title: 'Centered',
			type: 'boolean',
			default: false
		},
		image: {
			title: 'With image',
			type: 'boolean',
			default: true
		}
	},
	contents: [{
		id: 'image',
		nodes: "image",
		title: 'image'
	}, {
		id: 'content',
		nodes: '(card_header|card_meta|card_description)+',
		title: 'content'
	}, {
		id: 'extra',
		nodes: 'paragraph+',
		title: 'extra'
	}],
	html: `<div class="ui [fluid] [centered] card">
		<div class="image [image|alt::hidden]" block-content="image"></div>
		<div class="content" block-content="content"></div>
		<div class="extra content" block-content="extra"></div>
	</div>`
};

exports.cardlink = {
	title: "Card Link",
	deprecated: true,
	menu: 'widget',
	icon: '<i class="icons"><i class="linkify icon"></i><i class="corner add icon"></i></i>',
	properties: {
		fluid: {
			title: 'Fluid',
			description: 'Takes up the width of its container',
			type: 'boolean',
			default: false
		},
		centered: {
			title: 'Centered',
			type: 'boolean',
			default: false
		},
		image: {
			title: 'With image',
			type: 'boolean',
			default: true
		},
		url: {
			title: 'Link',
			description: 'link the entire content to another page',
			nullable: true,
			type: "string",
			format: "uri-reference",
			$helper: {
				name: 'href',
				filter: {
					type: ["link"]
				}
			}
		}
	},
	contents: [{
		id: 'image',
		nodes: "image",
		title: 'image'
	}, {
		id: 'content',
		nodes: '(card_header_nolink|card_meta_nolink|card_description_nolink)+',
		title: 'content'
	}, {
		id: 'extra',
		nodes: 'paragraph_nolink+',
		title: 'extra'
	}],
	html: `<a href="[url]" class="ui [fluid] [centered] card">
		<div class="image [image|alt::hidden]" block-content="image"></div>
		<div class="content" block-content="content"></div>
		<div class="extra content" block-content="extra"></div>
	</a>`
};

exports.card_header = {
	title: 'header',
	menu: 'widget',
	context: 'card//',
	icon: '<b class="icon">H</b>',
	contents: "inline*",
	html: '<div class="header">Header</div>'
};
exports.card_header_nolink = { ...exports.card_header,
	context: 'cardlink//',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<div class="header">Header</div>'
};

exports.card_meta = {
	title: 'meta',
	menu: 'widget',
	context: 'card//',
	icon: '<em class="icon">M</em>',
	contents: "inline*",
	html: '<div class="meta">Meta</div>'
};
exports.card_meta_nolink = { ...exports.card_meta,
	context: 'cardlink//',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<div class="meta">Meta</div>'
};

exports.card_description = {
	title: 'description',
	menu: 'widget',
	context: 'card//',
	icon: '<span class="icon">P</span>',
	inplace: true,
	contents: "paragraph+",
	html: '<div class="description"></div>'
};
exports.card_description_nolink = { ...exports.card_description,
	context: 'cardlink//',
	contents: "paragraph_nolink+",
	html: '<div class="description"></div>'
};

