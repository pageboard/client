exports.cards = {
	title: "Cards",
	menu: 'widget',
	icon: '<i class="icon address card outline"></i>',
	group: "block",
	contents: "(card|cardlink)+",
	properties: {
		columnCount: {
			title: 'Column count',
			description: 'How many cards should exist in a row - zero for unknown',
			type: 'integer',
			minimum: 0,
			default: 0
		}
	},
	html: '<div class="ui [columnCount|num] doubling stackable cards"></div>',
	stylesheets: [
		'../lib/components/card.css'
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
	html: `<div class="ui [fluid|?] [centered|?] card">
		<div class="image [image|?::hidden]" block-content="image"></div>
		<div class="content" block-content="content"></div>
		<div class="extra content" block-content="extra"></div>
	</div>`
};

exports.cardlink = {
	title: "Card Link",
	menu: 'widget',
	group: 'blocklink',
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
	html: `<a href="[url]" class="ui [fluid|?] [centered|?] card">
		<div class="image [image|?::hidden]" block-content="image"></div>
		<div class="content" block-content="content"></div>
		<div class="extra content" block-content="extra"></div>
	</a>`
};

exports.card_header = {
	title: 'header',
	menu: 'widget',
	context: 'card//',
	icon: '<b class="icon">H</b>',
	inplace: true,
	contents: "inline*",
	html: '<div class="header">Header</div>'
};
exports.card_header_nolink = Object.assign({}, exports.card_header, {
	context: 'cardlink//',
	group: 'blocklink',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<div class="header">Header</div>'
});

exports.card_meta = {
	title: 'meta',
	menu: 'widget',
	context: 'card//',
	icon: '<em class="icon">M</em>',
	inplace: true,
	contents: "inline*",
	html: '<div class="meta">Meta</div>'
};
exports.card_meta_nolink = Object.assign({}, exports.card_meta, {
	context: 'cardlink//',
	group: 'blocklink',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: '<div class="meta">Meta</div>'
});

exports.card_description = {
	title: 'description',
	menu: 'widget',
	context: 'card//',
	icon: '<span class="icon">P</span>',
	inplace: true,
	contents: "paragraph+",
	html: '<div class="description"></div>'
};
exports.card_description_nolink = Object.assign({}, exports.card_description, {
	context: 'cardlink//',
	group: 'blocklink',
	contents: "paragraph_nolink+",
	html: '<div class="description"></div>'
});

