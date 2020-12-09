exports.sticky = {
	title: "Sticky",
	icon: '<i class="icon pin"></i>',
	menu: "widget",
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
	],
	scripts: [
		'../ui/stickyfill.js',
		'../ui/sticky.js'
	],
	polyfills: [
		'ResizeObserver'
	]
};

exports.header.properties.collapsed = {
	title: "Collapsed",
	description: "Collapse to zero height",
	default: false,
	type: "boolean"
};
exports.header.tag += ',[block-type="header"]';
exports.header.html = `<element-sticky class="header" data-collapsed="[collapsed|magnet]">
	<header block-content="content"></header>
</element-sticky>`;
exports.header.scripts = exports.sticky.scripts.slice();
exports.header.stylesheets = exports.sticky.stylesheets.concat(['../ui/layout.css']);
exports.header.polyfills = exports.sticky.polyfills;


