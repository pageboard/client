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

Pageboard.elements.color = {
	title: "Color",
	properties: {
		color: {
			default: "",
			oneOf: [{
				constant: "white",
				title: "White"
			}, {
				constant: "",
				title: "Black"
			}, {
				constant: "red",
				title: "Red"
			}, {
				constant: "orange",
				title: "Orange"
			}, {
				constant: "yellow",
				title: "Yellow"
			}, {
				constant: "green",
				title: "Green"
			}, {
				constant: "blue",
				title: "Blue"
			}, {
				constant: "purple",
				title: "Purple"
			}]
		}
	},
	parse: function(dom) {
		var prop = Pageboard.elements.color.properties.color;
		var color = prop.oneOf.find(function(item) {
			return item.constant && dom.classList.contains(item.constant);
		});
		if (color) color = color.constant;
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
