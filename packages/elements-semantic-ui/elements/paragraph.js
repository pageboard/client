Pageboard.elements.paragraph = {
	title: "Paragraph",
	priority: -10,
	properties: {
		align: {
			title: 'Align',
			default: "",
			oneOf: [{
				constant: "",
				title: "left"
			}, {
				constant: "center",
				title: "center"
			}, {
				constant: "right",
				title: "right"
			}]
		}
	},
	parse: function(dom) {
		var align = "";
		if (dom.classList.contains("aligned")) {
			if (dom.classList.contains("center")) {
				align = "center";
			} else if (dom.classList.contains("right")) {
				align = "right";
			}
		}
		return {align: align};
	},
	contents: "inline*",
	group: "block",
	inplace: true,
	icon: '<i class="icon paragraph"></i>',
	render: function(doc, block) {
		var p = doc.dom`<p></p>`;
		if (block.data.align) p.classList.add(block.data.align, "aligned");
		return p;
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
		}
	},
	contents: {
		"text": "inline*"
	},
	group: "block",
//	inplace: true,
	icon: '<i class="icon header"></i>',
	tag: 'h1,h2,h3,h4,h5,h6',
	parse: function(dom) {
		var level = parseInt(dom.nodeName.substring(1));
		return {level: level};
	},
	render: function(doc, block) {
		var node = doc.createElement('h' + block.data.level);
		node.setAttribute('block-content', 'text');
		return node;
	}
};
