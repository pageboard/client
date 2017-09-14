Pageboard.elements.paragraph = {
	title: "Paragraph",
	priority: -10,
	properties: {
		align: {
			title: 'Align',
			default: "left",
			oneOf: [{
				constant: "left",
				title: "left",
				icon: '<i class="icon align left"></i>'
			}, {
				constant: "center",
				title: "center",
				icon: '<i class="icon align center"></i>'
			}, {
				constant: "right",
				title: "right",
				icon: '<i class="icon align right"></i>'
			}, {
				constant: "justify",
				title: "justify",
				icon: '<i class="icon align justify"></i>'
			}]
		}
	},
	parse: function(dom) {
		return {align: window.getComputedStyle(dom).textAlign};
	},
	contents: "inline*",
	group: "block",
	inplace: true,
	icon: '<i class="icon paragraph"></i>',
	render: function(doc, block) {
		var p = doc.dom`<p></p>`;
		var align = block.data.align || "left";
		if (align != "left") p.classList.add(align, "aligned");
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
