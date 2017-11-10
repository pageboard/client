Pageboard.elements.strong = {
	title: "Strong",
	contents: "text*",
	inplace: true,
	inline: true,
	group: "inline",
	icon: '<i class="icon bold"></i>',
	render: function(doc, block) {
		return doc.dom`<strong></strong>`;
	}
};

Pageboard.elements.em = {
	title: "Emphasize",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline",
	icon: '<i class="icon italic"></i>',
	render: function(doc, block) {
		return doc.dom`<em></em>`;
	}
};

Pageboard.elements.light = {
	title: "Light",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline",
	icon: '<i class="icon" style="font-weight:lighter">L</i>',
	render: function(doc, block) {
		return doc.dom`<span class="lighter"></span>`;
	}
};

Pageboard.elements.sup = {
	title: "Sup",
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline",
	icon: '<b class="icon">S<sup>up</sup></b>',
	render: function(doc, block) {
		return doc.dom`<sup></sup>`;
	}
};

Pageboard.elements.color = {
	title: "Color",
	properties: {
		color: {
			default: "",
			oneOf: [{
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
		var color = prop.oneOf.find(function(item) {
			return item.const && dom.classList.contains(item.const);
		});
		if (color) color = color.const;
		else color = prop.default;
		return {color: color};
	},
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline",
	icon: `<i class="icon" style="background-image:
		linear-gradient(
			to right,
			red, orange, yellow, green, blue, purple
		);"></i>`,
	render: function(doc, block) {
		return doc.dom`<span class="${block.data.color} color"></span>`;
	}
};
