Pageboard.elements.strong = {
	priority: 12,
	title: "Strong",
	contents: "text*",
	inplace: true,
	inline: true,
	group: "inline nolink",
	icon: '<i class="icon bold"></i>',
	render: function(doc, block) {
		return doc.dom`<strong></strong>`;
	}
};

Pageboard.elements.em = {
	priority: 12,
	title: "Emphasize",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	icon: '<i class="icon italic"></i>',
	render: function(doc, block) {
		return doc.dom`<em></em>`;
	}
};

Pageboard.elements.light = {
	priority: 12,
	title: "Light",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	icon: '<i class="icon" style="font-weight:lighter">L</i>',
	render: function(doc, block) {
		return doc.dom`<span class="lighter"></span>`;
	}
};

Pageboard.elements.sup = {
	priority: 12,
	title: "Sup",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline nolink",
	icon: '<b class="icon">S<sup>up</sup></b>',
	render: function(doc, block) {
		return doc.dom`<sup></sup>`;
	}
};

Pageboard.elements.caps = {
	priority: 12,
	title: "Capitalization",
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
	icon: '<span class="icon">Aa</span>',
	render: function(doc, block) {
		return doc.dom`<span class="${block.data.transform}"></span>`;
	}
};

Pageboard.elements.color = {
	priority: 12,
	title: "Color",
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
		var prop = Pageboard.elements.color.properties.color;
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
	icon: `<i class="icon" style="background-image:
		linear-gradient(
			to right,
			red, orange, yellow, green, blue, purple
		);"></i>`,
	render: function(doc, block) {
		return doc.dom`<span class="${block.data.color} color"></span>`;
	}
};
