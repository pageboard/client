exports.strong = {
	priority: 12,
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
	priority: 12,
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
	priority: 12,
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
	priority: 12,
	title: "Light",
	icon: '<i class="icon" style="font-weight:lighter">L</i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	html: '<span class="lighter"></span>'
};

exports.sup = {
	priority: 12,
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
	priority: 12,
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
	priority: 12,
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
	priority: 12,
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
	priority: 12,
	title: "Capitalization",
	icon: '<span class="icon">A<span style="font-variant: small-caps;">a</span></span>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	tag: 'span[block-type="caps"]',
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
	priority: 12,
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
		var prop = this.properties.color;
		var color = prop.anyOf.find(function(item) {
			return item.const && dom.classList.contains(item.const);
		});
		if (color) color = color.const;
		else color = prop.default;
		return {color: color};
	},
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	html: '<span class="[color] color"></span>'
};
