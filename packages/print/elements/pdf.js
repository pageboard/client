
// extend page
exports.pdf = {
	...exports.page,
	title: 'PDF',
	icon: '<i class="icon file pdf outline"></i>',
	contents: {
		id: 'body',
		nodes: 'block+'
	},
	stylesheets: [ ...exports.page.stylesheets.slice(0, 2),
		'../ui/pdf.css'
	],
	scripts: [ ...exports.page.scripts,
		'../ui/pdf.js'
	],
	output: {
		display: true,
		fonts: true,
		medias: true,
		pdf: true
	}
};
exports.pdf.properties = { ...exports.pdf.properties };
exports.pdf.properties.url = {
	...exports.pdf.properties.url,
	pattern: /^(\/[a-zA-Z0-9-]*)+$/.source
};

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
