exports.paragraph_nolink = { ...exports.paragraph,
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
		size: {
			title: 'Size',
			anyOf: [{
				const: 'mini',
				title: 'Mini'
			}, {
				type: 'null',
				title: 'Normal'
			}, {
				const: 'large',
				title: 'Large'
			}]
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
	html: '<div class="ui [size] [raised] [disabled] [inverted] [padded] [compact] [circular] [basic] [attached|switch:both: |post: attached] [align|post: aligned] segment"></div>',
	stylesheets: [
		'../lib/components/segment.css'
	]
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
	html: '<div class="ui divider [ruler|or:hidden] [large|alt:section] [clearing] [fitted]"></div>',
	stylesheets: [
		'../lib/components/divider.css'
	]
};

