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
		fullheight: {
			title: 'full height',
			description: 'Use 100% height',
			default: false,
			type: 'boolean'
		},
		stack: {
			title: 'stack',
			description: 'Stack layout vertically',
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
		var d = doc.dom`<div class="layout" block-content="content"></div>`;
		var data = block.data;
		var list = d.classList;
		if (data.width == "full") list.add('fullwidth');
		else if (data.width == "contained") list.add('ui', 'container');
		if (data.horizontal) list.add(data.horizontal);
		if (data.vertical) list.add(data.vertical);
		if (data.fullheight) list.add('fullheight');
		if (data.stack) list.add('stack');
		return d;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/container.css',
		'../ui/layout.css'
	]
};

