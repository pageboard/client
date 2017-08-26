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
		fullwidth: {
			title: 'full width',
			description: 'Use 100% width',
			default: true,
			type: 'boolean'
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
		d.classList.add(
			data.horizontal || '',
			data.vertical || '',
			data.fullwidth ? 'fullwidth' : '',
			data.fullheight ? 'fullheight' : '',
			data.stack ? 'stack' : ''
		);
		return d;
	},
	stylesheets: [
		'../ui/layout.css'
	]
};

