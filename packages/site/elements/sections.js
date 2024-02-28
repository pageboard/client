exports.hard_break = {
	inline: true,
	inplace: true,
	group: 'inline',
	tag: 'br',
	html: '<br />'
};

exports.paragraph = {
	title: "Paragraph",
	priority: -10,
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
		},
		size: {
			title: 'Size',
			default: null,
			anyOf: [{
				const: null,
				title: 'Default',
				icon: '<span class="icon">∅</span>'
			}, {
				const: 'tiny',
				title: 'Tiny',
				icon: '<span class="icon char" style="font-size:0.6em;margin-inline:0.6rem">aA</span>'
			}, {
				const: 'small',
				title: 'Small',
				icon: '<span class="icon char" style="font-size:0.8em;margin-inline:0.6rem">aA</span>'
			}, {
				const: 'base',
				title: 'Base',
				icon: '<span class="icon char" style="font-size:1em;margin-inline:0.6rem">aA</span>'
			}, {
				const: 'large',
				title: 'Large',
				icon: '<span class="icon char" style="font-size:1.2em;margin-inline:0.6rem">aA</span>'
			}, {
				const: 'extra',
				title: 'Extra',
				icon: '<span class="icon char" style="font-size:1.6em;margin-inline:0.6rem">aA</span>'
			}]
		}
	},
	parse: function(dom) {
		const data = {};
		for (const [key, schema] of Object.entries(this.properties)) {
			if (schema.anyOf) for (const item of schema.anyOf) {
				if (item.const && dom.classList.contains(item.const)) {
					data[key] = item.const;
				}
			}
		}
		if (dom.translate === false) data.idiom = true;
		return data;
	},
	contents: "inline*",
	group: "block",
	tag: 'p',
	html: '<p class="[align|post: aligned] [size]">Text</p>',
	stylesheets: [
		'../ui/sections.css'
	]
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

