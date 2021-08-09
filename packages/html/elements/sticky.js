exports.sticky = {
	title: "Old Sticky",
	group: "block",
	properties: {
		position: {
			title: "Position",
			default: "top",
			anyOf: [{
				const: "top",
				title: "top"
			}, {
				const: "bottom",
				title: "bottom"
			}]
		},
		collapsed: {
			title: "Collapsed",
			description: "Collapse to zero height",
			default: false,
			type: "boolean"
		}
	},
	contents: "block+",
	html: '<element-sticky data-collapsed="[collapsed|magnet]" data-position="[position]"></element-sticky>',
	stylesheets: [
		'../ui/sticky.css'
	]
};

exports.header.properties.collapsed = {
	title: "Collapsed",
	description: "Collapse to zero height",
	default: false,
	type: "boolean"
};
exports.header.properties.autohide = {
	title: "Auto-hide",
	description: "Hide on scroll down",
	default: false,
	type: "boolean"
};

exports.header.fragments.push({
	attributes: {
		"is": "element-sticky-nav",
		"class": "[collapsed|?] [autohide|?]"
	}
});
exports.header.stylesheets.push('../ui/sticky.css');
exports.header.scripts.push('../ui/sticky.js');
