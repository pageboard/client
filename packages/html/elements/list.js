exports.list_item = {
	title: 'Item',
	inplace: true,
	contents: "textblock list?",
	icon: '<i class="list icon"></i>',
	html: `<li></li>`,
};
exports.textblock = {
	title: 'Text',
	inplace: true,
	contents: "inline*",
	html: '<span></span>'
};
exports.list = {
	title: 'List',
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
	tag: 'ul,ol',
	parse: function(dom) {
		let marker = null;
		const style = dom.style.listStyleType;
		if (style && this.properties.marker.anyOf.some(item => item.const == style)) {
			marker = style;
		} else if (dom.nodeName == "OL") {
			marker = 'decimal';
		}
		return { marker };
	},
	html: `
		<ul style-list-style-type="[marker]">[marker|eq:square:|eq:disc:|!|bmagnet:*]</ul>
		<ol style-list-style-type="[marker]" start="[start]">[marker|eq:square:|eq:disc:|bmagnet:*]</ol>
	`
};

