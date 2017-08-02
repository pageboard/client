Pageboard.elements.shutter = {
	title: "Shutter",
	properties: {},
	group: "block",
	contents: {
		tabs: {
			spec: "shutter_item+",
			title: 'Tabs'
		}
	},
	menu: 'layout',
	icon: '<b class="icon">Shu</b>',
	render: function(doc, block) {
		return doc.dom`<div
			class="ui shutter stackable equal width grid"
			block-content="tabs"
		></div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/grid.css',
		'ui/shutter.css'
	]
};


Pageboard.elements.shutter_item = {
	title: "Shutter Tab",
	properties: {
		invert: {
			title: 'Invert',
			description: 'Invert color',
			default: "normal",
			oneOf: [{
				constant: "normal",
				title: "Normal"
			}, {
				constant: "invert",
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
	menu: 'layout',
	icon: '<b class="icon">Tab</b>',
	render: function(doc, block) {
		var invert = block.data.invert == "normal" ? "" : "invert";
		return doc.dom`<div class="column ${invert}">
			<div block-content="image"></div>
			<div block-content="text"></div>
		</div>`;
	}
};

