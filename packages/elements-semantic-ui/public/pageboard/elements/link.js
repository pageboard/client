(function(exports) {

exports.link = Object.assign(exports.link || {}, {
	title: "Link",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri"
		},
		target: {
			title: 'Target',
			description: 'Choose how to open link',
			default: "",
			oneOf: [{
				constant: "",
				title: "auto target"
			}, {
				constant: "_blank",
				title: "new window"
			}, {
				constant: "_self",
				title: "same window"
			}]
		}
	},
	inline: true,
	group: "inline",
	icon: '<svg viewBox="0 0 951 1024"><path d="M832 694q0-22-16-38l-118-118q-16-16-38-16-24 0-41 18 1 1 10 10t12 12 8 10 7 14 2 15q0 22-16 38t-38 16q-8 0-15-2t-14-7-10-8-12-12-10-10q-18 17-18 41 0 22 16 38l117 118q15 15 38 15 22 0 38-14l84-83q16-16 16-38zM430 292q0-22-16-38l-117-118q-16-16-38-16-22 0-38 15l-84 83q-16 16-16 38 0 22 16 38l118 118q15 15 38 15 24 0 41-17-1-1-10-10t-12-12-8-10-7-14-2-15q0-22 16-38t38-16q8 0 15 2t14 7 10 8 12 12 10 10q18-17 18-41zM941 694q0 68-48 116l-84 83q-47 47-116 47-69 0-116-48l-117-118q-47-47-47-116 0-70 50-119l-50-50q-49 50-118 50-68 0-116-48l-118-118q-48-48-48-116t48-116l84-83q47-47 116-47 69 0 116 48l117 118q47 47 47 116 0 70-50 119l50 50q49-50 118-50 68 0 116 48l118 118q48 48 48 116z"></path></svg>',
	view: function(doc, block) {
		return doc.dom`<a href="${block.data.url}" target="${block.data.target}"></a>`;
	}
});

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

