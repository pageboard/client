
// extend page
exports.pdf = Object.assign({}, exports.page, {
	title: 'PDF',
	icon: '<i class="icon file pdf outline"></i>',
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
exports.pdf.properties.url.pattern = "^(/[a-zA-Z0-9-]*)+$";

if (exports.sitemap) exports.sitepdf = exports.sitemap.itemModel('pdf', true);

exports.sheet = {
	title: 'Sheet',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icon file outline"></i>',
	contents: {
		id: "page",
		nodes: "block+"
	},
	upgrade: {
		'content.' : 'content.page'
	},
	html: '<div class="page-sheet"><div block-content="page"></div></div>'
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
