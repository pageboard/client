
// extend page
exports.pdf = Object.assign({}, exports.page, {
	title: 'PDF',
	properties: Object.assign({}, exports.page.properties),
	contents: {
		id: 'body',
		nodes: 'block+'
	},
	stylesheets: exports.page.stylesheets.slice(0, 2).concat([
		'../ui/pdf.css'
	]),
	scripts: exports.page.scripts.concat([
		'../ui/pdf.js'
	]),
	output: {
		display: true,
		fonts: true,
		medias: true,
		pdf: true
	}
});

exports.sitepdf = {
	title: "PDF",
	menu: "link",
	alias: 'pdf',
	group: 'sitemap_item',
	properties: Pageboard.elements.pdf.properties,
	icon: '<i class="icon file pdf outline"></i>',
	context: Pageboard.elements.sitemail.context,
	render: Pageboard.elements.sitemail.render
};

exports.sheet = {
	title: 'Sheet',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icon file outline"></i>',
	contents: "block+",
	html: '<div class="page-sheet"></div>'
};

exports.break = {
	title: 'Break',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icon cut"></i>',
	html: '<div class="page-break"></div>'
};

exports.nobreak = {
	title: 'Avoid',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icons"><i class="blue dont icon"></i><i class="icon cut"></i></i>',
	contents: "block+",
	html: '<div class="page-nobreak"></div>'
};
