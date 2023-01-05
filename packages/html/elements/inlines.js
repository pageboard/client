exports.strong = {
	priority: 100,
	title: "Strong",
	contents: "text*",
	inplace: true,
	inline: true,
	group: "inline nolink",
	icon: '<i class="icon bold"></i>',
	tag: 'strong,b',
	html: '<strong></strong>'
};

exports.em = {
	priority: 101,
	title: "Emphasize",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	icon: '<b class="icon">em</b>',
	tag: 'em',
	html: '<em></em>'
};

exports.i = {
	priority: 102,
	title: "Italic",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	icon: '<i class="icon italic"></i>',
	tag: 'i',
	html: '<i></i>'
};

exports.light = {
	priority: 103,
	title: "Light",
	icon: '<i class="icon" style="font-weight:lighter">L</i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	html: '<span class="lighter"></span>'
};

exports.sup = {
	priority: 104,
	title: "Sup",
	icon: '<i class="superscript icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	tag: 'sup',
	html: '<sup></sup>'
};

exports.sub = {
	priority: 105,
	title: "Inf",
	icon: '<i class="subscript icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	tag: 'sub',
	html: '<sub></sub>'
};

exports.strike = {
	priority: 106,
	title: "Strike",
	icon: '<i class="strikethrough icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	tag: 's',
	html: '<s></s>'
};

exports.u = {
	priority: 107,
	title: "Strike",
	icon: '<i class="underline icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	tag: 'u',
	html: '<u></u>'
};

exports.caps = {
	priority: 108,
	title: "Capitalization",
	icon: '<span class="icon">A<span style="font-variant: small-caps;">a</span></span>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	parse: function(dom) {
		return { transform: dom.className };
	},
	tag: 'span.uppercase,span.lowercase,span.capitalize,span.smallcaps',
	properties: {
		transform: {
			title: 'Transform',
			default: "uppercase",
			anyOf: [{
				const: "uppercase",
				title: "upper",
				icon: '<span class="icon">A</span>'
			}, {
				const: "lowercase",
				title: "lower",
				icon: '<span class="icon">a</span>'
			}, {
				const: "capitalize",
				title: "all caps",
				icon: '<span class="icon" style="text-transform:capitalize">Aa</span>'
			}, {
				const: "smallcaps",
				title: "small caps",
				icon: '<span class="icon" style="font-variant:small-caps">Aa</span>'
			}]
		}
	},
	html: '<span class="[transform]"></span>'
};

exports.color = {
	priority: 109,
	title: "Color",
	icon: `<i class="icon" style="background-image:
		linear-gradient(
			to right,
			red, orange, yellow, green, blue, purple
		);"></i>`,
	properties: {
		color: {
			default: "",
			anyOf: [{
				const: "white",
				title: "White"
			}, {
				const: "",
				title: "Black"
			}, {
				const: "red",
				title: "Red"
			}, {
				const: "orange",
				title: "Orange"
			}, {
				const: "yellow",
				title: "Yellow"
			}, {
				const: "green",
				title: "Green"
			}, {
				const: "blue",
				title: "Blue"
			}, {
				const: "purple",
				title: "Purple"
			}]
		}
	},
	parse: function(dom) {
		const prop = this.properties.color;
		const color = (prop.anyOf.find(item => {
			return item.const && dom.classList.contains(item.const);
		}) || { const: prop.default }).const;
		return { color: color };
	},
	contents: "text*",
	inline: true,
	inplace: true,
	tag: 'span.color',
	group: "inline nolink",
	html: '<span class="[color] color"></span>'
};
