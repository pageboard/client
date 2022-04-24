exports.paragraph_nolink = { ...exports.paragraph,
	priority: exports.paragraph.priority - 1,
	group: null,
	contents: {
		nodes: "inline*",
		marks: "nolink"
	}
};

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
				const: null,
				title: 'No',
			}, {
				const: 'top',
				title: 'Top'
			}, {
				const: 'both',
				title: 'Both'
			}, {
				const: 'bottom',
				title: 'Bottom'
			}]
		},
		align: {
			title: 'Align',
			anyOf: [{
				const: null,
				title: "Left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "Center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "Right",
				icon: '<i class="icon align right"></i>'
			}]
		},
	},
	contents: "block+",
	group: "block",
	icon: '<b class="icon">Seg</b>',
	html: '<div class="ui [raised|?] [disabled|?] [inverted|?] [padded|?] [compact|?] [circular|?] [basic|?] [attached|eq:both:%20|post:%20attached] [align|post:%20aligned] segment"></div>',
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
				title: "Left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "Center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "Right",
				icon: '<i class="icon align right"></i>'
			}, {
				const: "justify",
				title: "Justify",
				icon: '<i class="icon align justify"></i>'
			}]
		},
		linkable: {
			title: 'Show hash link',
			description: 'On hover',
			type: 'boolean',
			default: false
		},
		id: {
			nullable: true,
			type: 'string',
			pattern: /^[a-z0-9-]*$/.source
		}
	},
	contents: {
		id: 'text',
		nodes: "inline*"
	},
	group: "block",
	icon: '<i class="icon header"></i>',
	tag: 'h1,h2,h3,h4,h5,h6',
	html: `<h[level] class="ui [align|or:left] aligned header" is="h[level]-helper" id="[id]">
		<a aria-hidden="true" href="[$loc.pathname][$loc.search][id|pre:#]">[linkable|bmagnet]#</a>
		<div block-content="text">Heading</div>
	</hn>`,
	parse: function(dom) {
		return {
			level: parseInt(dom.nodeName.substring(1))
		};
	},
	stylesheets: [
		'../ui/heading.css'
	],
	resources: {
		helper: '../ui/heading-helper.js'
	},
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources.helper, scope);
	}
};


exports.heading_nolink = {
	...exports.heading,
	priority: exports.heading.priority - 1,
	group: null,
	contents: { ...exports.heading.contents, marks: "nolink" }
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

