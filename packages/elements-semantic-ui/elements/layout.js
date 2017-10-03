Pageboard.elements.layout = {
	title: "Layout",
	properties: {
		horizontal: {
			title: 'horizontal',
			description: 'Position horizontally',
			default: "left",
			oneOf: [{
				constant: "left",
				title: "left"
			}, {
				constant: "hcenter",
				title: "center"
			}, {
				constant: "right",
				title: "right"
			}]
		},
		vertical: {
			title: 'vertical',
			description: 'Position vertically',
			default: "top",
			oneOf: [{
				constant: "top",
				title: "top"
			}, {
				constant: "vcenter",
				title: "center"
			}, {
				constant: "bottom",
				title: "bottom"
			}]
		},
		width: {
			title: 'control width',
			default: "full",
			oneOf: [{
				constant: "full",
				title: "full"
			}, {
				constant: "contained",
				title: "contained"
			}]
		},
		height: {
			title: 'height',
			description: 'height in vh units',
			type: 'number',
			minimum: 0,
			maximum: 999,
			multipleOf: 10,
			default: 0
		},
		direction: {
			title: 'direction',
			default: "column",
			oneOf: [{
				constant: "column",
				title: "column"
			}, {
				constant: "row",
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
			node.style.height = d.height + 'vh';
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

Pageboard.elements.section = {
	title: "Section",
	properties: {
		section: {
			title: 'Section',
			default: 'main',
			oneOf: [{
				constant: "main",
				title: "main"
			}, {
				constant: "header",
				title: "header"
			}, {
				constant: "footer",
				title: "footer"
			}]
		}
	},
	contents: {
		content: {
			spec: "block+"
		}
	},
	icon: '<b class="icon">Sec</b>',
	context: 'page/',
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<${d.section} block-content="content"></${d.section}>`;
	},
	stylesheets: [
		'../ui/layout.css'
	]
};

