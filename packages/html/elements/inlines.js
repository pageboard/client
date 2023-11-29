exports.strong = {
	title: "Strong",
	priority: 100,
	contents: "text*",
	inplace: true,
	inline: true,
	excludes: 'light',
	group: "inline nolink",
	icon: '<i class="icon bold"></i>',
	tag: 'strong,b',
	html: '<strong></strong>'
};

exports.em = {
	title: "Emphasize",
	priority: 101,
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	icon: '<b class="icon">em</b>',
	tag: 'em',
	html: '<em></em>'
};

exports.i = {
	title: "Italic",
	priority: 102,
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	icon: '<i class="icon italic"></i>',
	tag: 'i',
	html: '<i></i>'
};

exports.light = {
	title: "Light",
	priority: 103,
	icon: '<i class="icon" style="font-weight:lighter">L</i>',
	contents: "text*",
	inline: true,
	inplace: true,
	excludes: 'strong',
	group: "inline nolink",
	html: '<span class="lighter"></span>'
};

exports.sup = {
	title: "Sup",
	priority: 104,
	icon: '<i class="superscript icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	excludes: 'sub',
	group: "inline nolink",
	tag: 'sup',
	html: '<sup></sup>'
};

exports.sub = {
	title: "Sub",
	priority: 105,
	icon: '<i class="subscript icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	excludes: 'sup',
	group: "inline nolink",
	tag: 'sub',
	html: '<sub></sub>'
};

exports.strike = {
	title: "Strike",
	priority: 106,
	icon: '<i class="strikethrough icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "nolink",
	tag: 's',
	html: '<s></s>'
};

exports.style = {
	title: "Style",
	priority: 99,
	icon: '<i class="paint brush icon"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	tag: 'span.style',
	properties: {
		size: {
			title: 'Size',
			default: null,
			anyOf: [{
				const: null,
				title: 'Default',
				icon: '<span class="icon">∅</span>'
			}, {
				const: 'small',
				title: 'Small',
				icon: '<span class="icon char" style="font-size:0.6em">aA</span>'
			}, {
				const: 'base',
				title: 'Base',
				icon: '<span class="icon char" style="font-size:0.8em">aA</span>'
			}, {
				const: 'large',
				title: 'Large',
				icon: '<span class="icon char" style="font-size:1.2em">aA</span>'
			}, {
				const: 'extra',
				title: 'Extra',
				icon: '<span class="icon char" style="font-size:1.6em">aA</span>'
			}]
		},
		transform: {
			title: 'Transform',
			default: null,
			anyOf: [{
				const: null,
				title: 'Default',
				icon: '<span class="icon">∅</span>'
			}, {
				const: "uppercase",
				title: "upper",
				icon: '<span class="icon">AB</span>'
			}, {
				const: "lowercase",
				title: "lower",
				icon: '<span class="icon">ab</span>'
			}, {
				const: "capitalize",
				title: "all caps",
				icon: '<span class="icon" style="text-transform:capitalize">Ab</span>'
			}, {
				const: "smallcaps",
				title: "small caps",
				icon: '<span class="icon" style="font-variant:small-caps">Ab</span>'
			}]
		},
		color: {
			title: 'Color',
			default: null,
			anyOf: [{
				const: null,
				title: 'Default',
				icon: '<span class="icon">∅</span>'
			}, {
				const: "white",
				title: "White",
				icon: '<i class="icon color" style="color:white">W</i>'
			}, {
				const: "black",
				title: "Black",
				icon: '<i class="icon color" style="color:black">B</i>'
			}, {
				const: "red",
				title: "Red",
				icon: '<i class="icon color" style="color:red">R</i>'
			}, {
				const: "orange",
				title: "Orange",
				icon: '<i class="icon color" style="color:orange">O</i>'
			}, {
				const: "yellow",
				title: "Yellow",
				icon: '<i class="icon color" style="color:yellow">Y</i>'
			}, {
				const: "green",
				title: "Green",
				icon: '<i class="icon color" style="color:green">G</i>'
			}, {
				const: "blue",
				title: "Blue",
				icon: '<i class="icon color" style="color:blue">B</i>'
			}, {
				const: "purple",
				title: "Purple",
				icon: '<i class="icon color" style="color:purple">P</i>'
			}]
		},
		idiom: {
			title: 'Untranslatable',
			type: 'boolean',
			default: false,
			nullable: true
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
	html: '<span class="style [size] [transform] [color]" translate="[idiom|alt:no:]"></span>',
	stylesheets: [
		'../ui/inlines.css'
	]
};

exports.caps = { // deprecated
	priority: 108,
	icon: '<span class="icon">A<span style="font-variant: small-caps;">a</span></span>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	parse: function(dom) {
		return { transform: dom.className };
	},
	tag: 'span.uppercase:not(.style),span.lowercase:not(.style),span.capitalize:not(.style),span.smallcaps:not(.style)',
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

exports.color = { // deprecated
	priority: 109,
	icon: '<span class="icon">C</span>',
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

exports.notranslate = {
	title: "Untranslatable",
	priority: 110,
	contents: "text*",
	inplace: true,
	inline: true,
	group: "inline nolink",
	icon: '<i class="large translate icon"></i>',
	tag: 'span[translate="no"]',
	html: '<span translate="no"></span>'
};

