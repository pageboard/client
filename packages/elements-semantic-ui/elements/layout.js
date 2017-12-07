Pageboard.elements.layout = {
	title: "Layout",
	properties: {
		horizontal: {
			title: 'horizontal',
			description: 'Position horizontally',
			default: "left",
			oneOf: [{
				const: "left",
				title: "left"
			}, {
				const: "hcenter",
				title: "center"
			}, {
				const: "right",
				title: "right"
			}]
		},
		vertical: {
			title: 'vertical',
			description: 'Position vertically',
			default: "top",
			oneOf: [{
				const: "top",
				title: "top"
			}, {
				const: "vcenter",
				title: "center"
			}, {
				const: "bottom",
				title: "bottom"
			}]
		},
		width: {
			title: 'control width',
			default: "full",
			oneOf: [{
				const: "full",
				title: "full"
			}, {
				const: "contained",
				title: "contained"
			}]
		},
		height: {
			title: 'height',
			description: 'height in vh units',
			type: 'number',
			minimum: 0,
			maximum: 999,
			default: 0
		},
		direction: {
			title: 'direction',
			default: "column",
			oneOf: [{
				const: "column",
				title: "column"
			}, {
				const: "row",
				title: "row"
			}]
		},
		invert: {
			title: 'invert',
			description: 'Invert background',
			default: false,
			type: 'boolean'
		}
	},
	contents: {
		content: {
			spec: "block+"
		}
	},
	group: 'block',
	icon: '<i class="icon move"></i>',
	render: function(doc, block) {
		var d = block.data;
		var node = doc.dom`<div class="layout" block-content="content"></div>`;
		var list = node.classList;
		if (d.width == "full") list.add('fullwidth');
		else if (d.width == "contained") list.add('ui', 'container');
		if (d.horizontal) list.add(d.horizontal);
		if (d.vertical) list.add(d.vertical);
		if (d.height) {
			node.style.height = d.height + '%';
		} else {
			node.style.height = "auto";
		}
		if (d.direction) list.add(d.direction);
		if (d.invert) list.add("inverted");
		return node;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/container.css',
		'../ui/layout.css'
	]
};

