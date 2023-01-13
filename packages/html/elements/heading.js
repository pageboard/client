exports.heading = {
	title: "Heading",
	priority: 10,
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
		},
		entitled: {
			title: 'H1 is a page title',
			type: 'boolean',
			nullable: true
		}
	},
	contents: {
		id: 'text',
		nodes: "inline*"
	},
	group: "block",
	icon: '<i class="icon header"></i>',
	tag: 'h1,h2,h3,h4,h5,h6',
	html: `<h[level] class="ui [align|or:left] aligned header" is="h[level]-helper" id="[id]" entitled="[entitled]">
		<a aria-hidden="true" href="[$loc.pathname][$loc.search][id|pre:#]">[linkable|bmagnet]#</a>
		<div block-content="text">Heading</div>
	</hn>`,
	parse: function (dom) {
		return {
			level: parseInt(dom.nodeName.substring(1))
		};
	},
	stylesheets: [
		'../ui/heading.css'
	],
	scripts: [
		'../ui/heading.js'
	],
	resources: {
		helper: '../ui/heading-helper.js'
	},
	install: function (scope) {
		if (scope.$write) Pageboard.load.js(this.resources.helper, scope);
	}
};


exports.heading_nolink = {
	...exports.heading,
	priority: exports.heading.priority - 1,
	group: null,
	contents: { ...exports.heading.contents, marks: "nolink" }
};

