exports.list_item = {
	title: 'Item',
	inplace: true,
	contents: "textblock (ul|ol)?",
	icon: '<i class="list icon"></i>',
	html: `<li></li>`,
};

exports.textblock = {
	title: 'Text',
	contents: "inline*",
	html: '<span class="textblock"></span>'
};

exports.ul = {
	title: 'Unordered List',
	properties: {
		marker: {
			title: 'Marker',
			anyOf: [{
				const: null,
				title: 'Default'
			}, {
				const: 'disc',
				title: 'Disc'
			}, {
				const: 'square',
				title: 'Square'
			}, {
				const: 'circle',
				title: 'Circle'
			}]
		}
	},
	inplace: true,
	contents: "list_item+",
	group: "block",
	icon: '<i class="list ul icon"></i>',
	tag: 'ul',
	parse: function(dom) {
		let marker = null;
		const style = dom.style.listStyleType;
		if (style && this.properties.marker.anyOf.some(item => item.const == style)) {
			marker = style;
		}
		return { marker };
	},
	html: `<ul style-list-style-type="[marker]"></ul>`
};

exports.ol = {
	title: 'Ordered List',
	properties: {
		marker: {
			title: 'Marker',
			anyOf: [{
				const: null,
				title: 'Default'
			}, {
				const: 'decimal',
				title: '1, 2, 3'
			}, {
				const: 'decimal-leading-zero',
				title: '01, 02, 03'
			}, {
				const: 'lower-roman',
				title: 'i, ii, iii'
			}, {
				const: 'upper-roman',
				title: 'I, II, III'
			}, {
				const: 'lower-latin',
				title: 'a, b, c'
			}, {
				const: 'upper-latin',
				title: 'A, B, C'
			}, {
				const: 'lower-greek',
				title: 'α, β, γ'
			}, {
				const: 'armenian',
				title: 'Armenian'
			}, {
				const: 'georgian',
				title: 'Georgian'
			}]
		},
		start: {
			title: 'Start',
			type: 'integer',
			default: 1,
			minimum: 0
		}
	},
	inplace: true,
	contents: "list_item+",
	group: "block",
	icon: '<i class="list ol icon"></i>',
	tag: 'ol',
	parse: function (dom) {
		let marker = null;
		const style = dom.style.listStyleType;
		if (style && this.properties.marker.anyOf.some(item => item.const == style)) {
			marker = style;
		}
		const start = dom.getAttribute('start') || null;
		return { marker, start };
	},
	html: `<ol style-list-style-type="[marker]" start="[start]"></ol>`
};
