exports.text.group += " mail_inline";

exports.hard_break.group += " mail_inline";

exports.mail_strong = {
	priority: 12,
	title: "Strong",
	icon: '<i class="icon bold"></i>',
	contents: "text*",
	inplace: true,
	inline: true,
	group: "mail_inline",
	html: '<strong></strong>'
};

exports.mail_em = {
	priority: 12,
	title: "Emphasize",
	icon: '<i class="icon italic"></i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "mail_inline",
	html: '<em></em>'
};

exports.mail_light = {
	priority: 12,
	title: "Light",
	icon: '<i class="icon" style="font-weight:lighter">L</i>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "mail_inline",
	html: '<span class="lighter"></span>'
};

exports.mail_sup = {
	priority: 12,
	title: "Sup",
	icon: '<b class="icon">S<sup>up</sup></b>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "mail_inline",
	html: '<sup></sup>'
};

exports.mail_caps = {
	priority: 12,
	title: "Capitalization",
	icon: '<span class="icon">Aa</span>',
	contents: "text*",
	inline: true,
	inplace: true,
	group: "mail_inline",
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

exports.mail_color = {
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
		const prop = this.properties.color;
		let color = prop.anyOf.find((item) => {
			return item.const && dom.classList.contains(item.const);
		});
		if (color) color = color.const;
		else color = prop.default;
		return {color: color};
	},
	contents: "text*",
	inline: true,
	inplace: true,
	group: "mail_inline",
	html: '<span class="[color] color"></span>'
};
