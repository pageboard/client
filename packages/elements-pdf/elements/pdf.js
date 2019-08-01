
// extend page
Pageboard.elements.pdf = Object.assign({}, Pageboard.elements.page, {
	title: 'PDF',
	properties: Object.assign({}, Pageboard.elements.page.properties),
	contents: {
		id: 'body',
		nodes: 'block+
	},
	stylesheets: [
		'../ui/pdf.css'
	]
});
Pageboard.elements.image.scripts.push('../ui/pdf.js');

Pageboard.elements.sitepdf = {
	title: "PDF",
	menu: "link",
	alias: 'pdf',
	group: 'sitemap_item',
	properties: Pageboard.elements.pdf.properties,
	icon: '<i class="icon file pdf outline"></i>',
	context: Pageboard.elements.sitemail.context,
	render: Pageboard.elements.sitemail.render
};

Pageboard.elements.sheet = {
	title: 'Sheet',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icon file outline"></i>',
	contents: "block+",
	html: '<div class="page-sheet"></div>'
};

Pageboard.elements.break = {
	title: 'Break',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icon cut"></i>',
	html: '<div class="page-break"></div>'
};

Pageboard.elements.nobreak = {
	title: 'Avoid',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icons"><i class="blue dont icon"></i><i class="icon cut"></i></i>',
	contents: "block+",
	html: '<div class="page-nobreak"></div>'
};
