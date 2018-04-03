Pageboard.elements.shutter = {
	title: "Shutter",
	menu: "widget",
	group: "block",
	contents: {
		tabs: {
			spec: "shutter_item+",
			title: 'Tabs'
		}
	},
	icon: '<b class="icon">Shu</b>',
	render: function(doc, block) {
		return doc.dom`<div
			class="ui shutter stackable equal width grid"
			block-content="tabs"
		></div>`;
	},
	stylesheets: [
		'../semantic-ui/grid.css',
		'../ui/shutter.css'
	]
};


Pageboard.elements.shutter_item = {
	title: "Shutter Tab",
	menu: "widget",
	properties: {
		invert: {
			title: 'Invert',
			description: 'Invert color',
			default: "normal",
			anyOf: [{
				const: "normal",
				title: "Normal"
			}, {
				const: "invert",
				title: "Invert"
			}]
		}
	},
	contents: {
		image: {
			spec: "image",
			title: "image"
		},
		text: {
			spec: "block+",
			title: "content"
		}
	},
	icon: '<i class="icons"><b class="icon">Shu</b><i class="corner add icon"></i></i>',
	render: function(doc, block) {
		var invert = block.data.invert == "normal" ? "" : "invert";
		return doc.dom`<div class="column ${invert}">
			<div block-content="image"></div>
			<div block-content="text"></div>
		</div>`;
	}
};

