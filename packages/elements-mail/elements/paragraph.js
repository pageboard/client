// https://foundation.zurb.com/emails/docs

Pageboard.elements.mail_paragraph = {
	title: "Paragraph",
	priority: -10,
	tag: 'p',
	isolating: false,
	properties: {
		align: {
			title: 'Align',
			default: "text-left",
			anyOf: [{
				const: "text-left",
				title: "left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "text-center",
				title: "center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "text-right",
				title: "right",
				icon: '<i class="icon align right"></i>'
			}]
		}
	},
	parse: function(dom) {
		var align = "text-left";
		var prop = Pageboard.elements.mail_paragraph.properties.align;
		align = prop.anyOf.find(function(item) {
			return dom.classList.contains(item.const);
		});
		if (!align) align = prop.default;
		else align = align.const;
		return {align: align};
	},
	contents: "mail_inline*",
	group: "mail_block",
	inplace: true,
	icon: '<i class="icon paragraph"></i>',
	render: function(doc, block) {
		return doc.dom`<p class="${block.data.align || 'text-left'}">Text</p>`;
	}
};


Pageboard.elements.mail_heading = {
	title: "Heading",
	properties: {
		level: {
			title: 'Level',
			description: 'Between 1 and 6',
			type: "integer",
			default: 1,
			minimum: 1,
			maximum: 6
		},
		align: {
			title: 'Align',
			default: "text-left",
			anyOf: [{
				const: "text-left",
				title: "left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "text-center",
				title: "center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "text-right",
				title: "right",
				icon: '<i class="icon align right"></i>'
			}]
		}
	},
	contents: {
		"text": "mail_inline*"
	},
	group: "mail_block",
	icon: '<i class="icon header"></i>',
	tag: 'h1,h2,h3,h4,h5,h6',
	parse: function(dom) {
		var level = parseInt(dom.nodeName.substring(1));
		return {level: level};
	},
	render: function(doc, block) {
		var node = doc.createElement('h' + block.data.level);
		node.setAttribute('block-content', 'text');
		node.className = `${block.data.align || 'text-left'}`;
		node.innerText = 'Heading';
		return node;
	}
};

