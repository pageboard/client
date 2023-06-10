exports.text = {
	inline: true,
	group: 'inline'
};

exports.hard_break = {
	inline: true,
	inplace: true,
	group: 'inline',
	tag: 'br',
	html: '<br />'
};

exports.paragraph = {
	priority: -10,
	title: "Paragraph",
	icon: '<i class="icon paragraph"></i>',
	isolating: false,
	properties: {
		align: {
			title: 'Align',
			anyOf: [{
				const: null,
				title: "Left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "Center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "Right",
				icon: '<i class="icon align right"></i>'
			}, {
				const: "justify",
				title: "Justify",
				icon: '<i class="icon align justify"></i>'
			}]
		}
	},
	parse: function(dom) {
		let align;
		const prop = this.properties.align;
		if (dom.classList.contains("aligned")) {
			align = prop.anyOf.find(item => {
				return dom.classList.contains(item.const);
			});
			if (align) align = align.const;
		}
		if (align == "left") align = null;
		return { align };
	},
	contents: "inline*",
	group: "block",
	tag: 'p',
	html: '<p class="[align|post: aligned]">Text</p>'
};

exports.header = {
	title: "Header",
	icon: '<b class="icon">Head</b>',
	group: "section",
	contents: {
		id: "content",
		nodes: "block+"
	},
	context: 'page/',
	tag: 'header',
	html: `<header block-content="content"></header>`
};

exports.main = {
	title: "Main",
	icon: '<b class="icon">Main</b>',
	group: "section",
	contents: "block+",
	context: 'page/',
	tag: "main",
	html: '<main></main>'
};

exports.footer = {
	title: "Footer",
	icon: '<b class="icon">Foot</b>',
	group: "section",
	contents: "block+",
	context: 'page/',
	tag: "footer",
	html: '<footer></footer>'
};

