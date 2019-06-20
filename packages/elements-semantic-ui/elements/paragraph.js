exports.paragraph_nolink = Object.assign({}, exports.paragraph, {
	priority: exports.paragraph.priority - 1,
	context: 'blocklink//',
	contents: {
		spec: "inline*",
		marks: "nolink"
	}
});

exports.segment = {
	title: "Segment",
	properties: {
		raised: {
			title: 'Raised',
			type: 'boolean',
			default: false
		},
		disabled: {
			title: 'Disabled',
			type: 'boolean',
			default: false
		},
		inverted: {
			title: 'Inverted',
			type: 'boolean',
			default: false
		},
		padded: {
			title: 'Padded',
			type: 'boolean',
			default: false
		},
		compact: {
			title: 'Compact',
			type: 'boolean',
			default: false
		},
		circular: {
			title: 'Circular',
			type: 'boolean',
			default: false
		},
		basic: {
			title: 'Basic',
			type: 'boolean',
			default: false
		},
		attached: {
			title: 'Attached',
			anyOf: [{
				type: 'null',
				title: 'no',
			}, {
				const: 'top',
				title: 'top'
			}, {
				const: 'both',
				title: 'both'
			}, {
				const: 'bottom',
				title: 'bottom'
			}]
		}
	},
	contents: {
		"content": "block+"
	},
	group: "block",
	icon: '<b class="icon">Seg</b>',
	html: '<div class="ui segment" block-content="content"></div>',
	fuse: function(node, d) {
		Object.keys(d).forEach(function(key) {
			if (this.properties[key].type == 'boolean' && d[key]) {
				node.classList.add(key);
			}
		}, this);
		if (d.attached) {
			if (d.attached != "both")	node.classList.add(d.attached);
			node.classList.add('attached');
		}
		return node;
	},
	stylesheets: [
		'../lib/components/segment.css'
	]
};

exports.heading = {
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
		},
		linkable: {
			title: 'Linkable',
			description: 'Shows a link hash on hover',
			type: 'boolean',
			default: false
		},
		id: {
			nullable: true,
			type: 'string'
		}
	},
	contents: {
		"text": "inline*"
	},
	group: "block",
	icon: '<i class="icon header"></i>',
	tag: 'h1,h2,h3,h4,h5,h6',
	html: `<h[level] class="ui [align|or:left] aligned header" is="h[level]-helper">
		<a aria-hidden="true" href="#[id]" id="[id]">[linkable|bmagnet]#</a>
		<div block-content="text">Heading</div>
	</hn>`,
	parse: function(dom) {
		var obj = {
			level: parseInt(dom.nodeName.substring(1))
		};
		var anchor = dom.querySelector('a');
		var id = anchor && anchor.getAttribute('id') || null;
		if (id) {
			obj.id = id;
			obj.linkable = true;
		}
		return obj;
	},
	stylesheets: [
		'../ui/heading.css'
	],
	resources: [
		'../ui/heading-helper.js'
	],
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources[0], scope);
	}
};

exports.divider = {
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
	html: '<div class="ui divider [ruler|!?:hidden] [large|?:section] [clearing|?] [fitted|?]"></div>',
	stylesheets: [
		'../lib/components/divider.css'
	]
};

