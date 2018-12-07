Pageboard.elements.cards = {
	title: "Cards",
	menu: 'widget',
	icon: '<i class="icon address card outline"></i>',
	group: "block",
	contents: {
		cards: {
			spec: "(card|cardlink)+"
		}
	},
	properties: {
		columnCount: {
			title: 'Column count',
			description: 'How many cards should exist in a row - zero for unknown',
			type: 'integer',
			minimum: 0,
			default: 0
		}
	},
	html: '<div class="ui [columnCount|num] doubling stackable cards" block-content="cards"></div>',
	stylesheets: [
		'../lib/components/card.css'
	]
};


Pageboard.elements.card = {
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
	contents: {
		image: {
			spec: "image",
			title: 'image'
		},
		content: {
			spec: '(card_header|card_meta|card_description)+',
			title: 'content'
		},
		extra: {
			spec: 'paragraph+',
			title: 'extra'
		}
	},
	html: `<div class="ui [fluid|?] [centered|?] card">
		<div class="image [image|?::hidden]" block-content="image"></div>
		<div class="content" block-content="content"></div>
		<div class="extra content" block-content="extra"></div>
	</div>`
};

Pageboard.elements.cardlink = {
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
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				format: "pathname"
			}],
			$helper: {
				name: 'href',
				filter: {
					type: ["link"]
				}
			}
		}
	},
	contents: {
		image: {
			spec: "image",
			title: 'image'
		},
		content: {
			spec: '(card_header_nolink|card_meta_nolink|card_description_nolink)+',
			title: 'content'
		},
		extra: {
			spec: 'paragraph_nolink+',
			title: 'extra'
		}
	},
	html: `<a href="[url]" class="ui [fluid|?] [centered|?] card">
		<div class="image [image|?::hidden]" block-content="image"></div>
		<div class="content" block-content="content"></div>
		<div class="extra content" block-content="extra"></div>
	</a>`
};

Pageboard.elements.card_header = {
	title: 'header',
	menu: 'widget',
	context: 'card//',
	icon: '<b class="icon">H</b>',
	inplace: true,
	contents: "inline*",
	html: '<div class="header">Header</div>'
};
Pageboard.elements.card_header_nolink = Object.assign({}, Pageboard.elements.card_header, {
	context: 'cardlink//',
	group: 'blocklink',
	contents: {
		spec: "inline*",
		marks: "nolink"
	},
	html: '<div class="header">Header</div>'
});

Pageboard.elements.card_meta = {
	title: 'meta',
	menu: 'widget',
	context: 'card//',
	icon: '<em class="icon">M</em>',
	inplace: true,
	contents: "inline*",
	html: '<div class="meta">Meta</div>'
};
Pageboard.elements.card_meta_nolink = Object.assign({}, Pageboard.elements.card_meta, {
	context: 'cardlink//',
	group: 'blocklink',
	contents: {
		spec: "inline*",
		marks: "nolink"
	},
	html: '<div class="meta">Meta</div>'
});

Pageboard.elements.card_description = {
	title: 'description',
	menu: 'widget',
	context: 'card//',
	icon: '<span class="icon">P</span>',
	inplace: true,
	contents: "paragraph+",
	html: '<div class="description"></div>'
};
Pageboard.elements.card_description_nolink = Object.assign({}, Pageboard.elements.card_description, {
	context: 'cardlink//',
	group: 'blocklink',
	contents: "paragraph_nolink+",
	html: '<div class="description"></div>'
});

