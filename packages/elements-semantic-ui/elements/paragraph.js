Pageboard.elements.paragraph = {
	title: "Paragraph",
	priority: -10,
	tag: 'p',
	isolating: false,
	properties: {
		align: {
			title: 'Align',
			default: "left",
			anyOf: [{
				const: "left",
				title: "left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "right",
				icon: '<i class="icon align right"></i>'
			}, {
				const: "justify",
				title: "justify",
				icon: '<i class="icon align justify"></i>'
			}]
		}
	},
	parse: function(dom) {
		var align = "left";
		var prop = Pageboard.elements.paragraph.properties.align;
		if (dom.classList.contains("aligned")) {
			align = prop.anyOf.find(function(item) {
				return dom.classList.contains(item.const);
			});
			if (!align) align = prop.default;
			else align = align.const;
		}
		return {align: align};
	},
	contents: "inline*",
	group: "block",
	inplace: true,
	icon: '<i class="icon paragraph"></i>',
	render: function(doc, block) {
		return doc.dom`<p class="${block.data.align || 'left'} aligned"></p>`;
	}
};

Pageboard.elements.heading = {
	title: "Heading",
	properties: {
		level: {
			title: 'Level',
			description: 'Between 1 and 6',
			type: "integer",
			default: 1,
			minimum: 1,
			maximum: 6
		},
		align: {
			title: 'Align',
			default: "left",
			anyOf: [{
				const: "left",
				title: "left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "right",
				icon: '<i class="icon align right"></i>'
			}, {
				const: "justify",
				title: "justify",
				icon: '<i class="icon align justify"></i>'
			}]
		}
	},
	contents: {
		"text": "inline*"
	},
	group: "block",
	icon: '<i class="icon header"></i>',
	tag: 'h1,h2,h3,h4,h5,h6',
	parse: function(dom) {
		var level = parseInt(dom.nodeName.substring(1));
		return {level: level};
	},
	render: function(doc, block) {
		var node = doc.createElement('h' + block.data.level);
		node.setAttribute('block-content', 'text');
		node.className = `${block.data.align || 'left'} aligned`;
		return node;
	}
};

Pageboard.elements.divider = {
	title: "Divider",
	group: "block",
	icon: '<b class="icon">--</b>',
	tag: 'hr,.divider',
	properties: {
		ruler: {
			title: 'Ruler',
			type: 'boolean',
			default: false
		},
		large: {
			title: 'Large',
			type: 'boolean',
			default: false
		},
		fitted: {
			title: 'Fitted',
			type: 'boolean',
			default: false
		},
		clearing: {
			title: 'Clearing',
			type: 'boolean',
			default: false
		}
	},
	render: function(doc, block) {
		var d = block.data;
		var node = doc.dom`<div class="ui divider"></div>`;
		if (d.ruler == false) node.classList.add('hidden');
		if (d.large) node.classList.add('section');
		if (d.clearing) node.classList.add('clearing');
		if (d.fitted) node.classList.add('fitted');
		return node;
	},
	stylesheets: [
		'../semantic-ui/divider.css'
	]
};
