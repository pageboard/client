exports.header.properties.collapsed = {
	title: "Collapsed",
	description: "Collapse to zero height",
	default: false,
	type: "boolean"
};
exports.header.html = `<element-sticky class="header" data-collapsed="[collapsed|magnet]">
	<header block-content="content"></header>
</element-sticky>`;
exports.header.scripts.push('../ui/stickyfill.js', '../ui/sticky.js');
exports.header.stylesheets.push('../ui/sticky.css', '../ui/layout.css');

exports.main.stylesheets.push('../ui/layout.css');

exports.footer.stylesheets.push('../ui/layout.css');

