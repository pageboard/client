Pageboard.elements.cards = {
	title: "Cards",
	menu: 'widget',
	group: "block",
	contents: {
		cards: {
			spec: "card+"
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
	icon: '<i class="icon address card outline"></i>',
	render: function(doc, block) {
		var count = '';
		if (block.data.columnCount > 0) count = {
			0: '',
			1: 'one',
			2: 'two',
			3: 'three',
			4: 'four',
			5: 'five',
			6: 'six',
			7: 'seven',
			8: 'eight',
			9: 'nine',
			10: 'ten',
			11: 'eleven',
			12: 'twelve',
			13: 'thirteen',
			14: 'fourteen',
			15: 'fifteen',
			16: 'sixteen'
		}[block.data.columnCount];
		return doc.dom`<div class="ui ${count} doubling stackable cards" block-content="cards"></div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/card.css'
	]
};


Pageboard.elements.card = {
	title: "Card",
	menu: 'widget',
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
		}
		url: {
			title: 'link',
			description: 'link the entire content to another page',
			oneOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
				name: 'href',
				filter: {
					type: ["link"]
				}
			}
		}
	},
	contents: {
		image: {
			spec: "image?",
			title: 'image'
		},
		content: {
			spec: '(card_header|card_meta|card_description)*',
			title: 'content'
		},
		extra: {
			spec: 'inline*',
			title: 'extra'
		}
	},
	icon: '<i class="icon address card outline"></i>',
	render: function(doc, block) {
		var d = block.data;
		var node = d.url ? doc.dom`<a href="${d.url}"></a>` : doc.dom`<div></div>`;
		node.classList.add('ui');
		if (d.fluid) node.classList.add('fluid');
		if (d.centered) node.classList.add('centered');
		node.classList.add('card');
		node.appendChild(doc.dom`
			<div class="image" block-content="image"></div>
			<div class="content" block-content="content"></div>
			<div class="extra content" block-content="extra"></div>
		`);
		return node;
	}
};

Pageboard.elements.card_header = {
	title: 'header',
	menu: 'widget',
	inplace: true,
	contents: {
		text: "inline*"
	},
	icon: '<b class="icon">H</b>',
	render: function(doc, block) {
		return doc.dom`<div class="header" block-content="text"></div>`;
	}
};

Pageboard.elements.card_meta = {
	title: 'meta',
	menu: 'widget',
	inplace: true,
	contents: {
		text: "inline*"
	},
	icon: '<em class="icon">M</em>',
	render: function(doc, block) {
		return doc.dom`<div class="meta" block-content="text"></div>`;
	}
};
Pageboard.elements.card_description = {
	title: 'description',
	menu: 'widget',
	inplace: true,
	contents: {
		paragraphs: "paragraph+"
	},
	icon: '<span class="icon">P</span>',
	render: function(doc, block) {
		return doc.dom`<div class="description" block-content="paragraphs"></div>`;
	}
};

