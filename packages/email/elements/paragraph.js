exports.mail_paragraph = {
	priority: -10,
	title: "Paragraph",
	icon: '<i class="icon paragraph"></i>',
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
		const prop = Pageboard.elements.mail_paragraph.properties.align;
		const align = (prop.anyOf.find((item) => {
			return dom.classList.contains(item.const);
		}) || { const: prop.default }).const;
		return {align: align};
	},
	contents: "mail_inline*",
	group: "mail_block",
	inplace: true,
	html: `<p class="[align|or:text-left]">Text</p>`
};


exports.mail_heading = {
	title: "Heading",
	icon: '<i class="icon header"></i>',
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
	contents: "mail_inline*",
	group: "mail_block",
	tag: 'h1,h2,h3,h4,h5,h6',
	html: '<h[level] class="[align|or:left]">Heading</hn>',
	parse: function(dom) {
		return { level: parseInt(dom.nodeName.substring(1)) };
	}
};

