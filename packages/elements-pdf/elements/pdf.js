
// extend page
Pageboard.elements.pdf = Object.assign({}, Pageboard.elements.page, {
	title: 'PDF',
	properties: Object.assign({}, Pageboard.elements.page.properties),
	contents: {
		body: {
			spec: 'block+',
			title: 'body'
		}
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
	unmount: function(block, node) {
		// added pages NEED to have their type overriden
		block.type = 'pdf';
		var pos = 0;
		while (node=node.previousElementSibling) pos++;
		block.data.index = pos;
	},
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
	contents: {
		content: {
			spec: "block+"
		}
	},
	render: function(doc, block) {
		return doc.dom`<div class="page-sheet" block-content="content"></div>`;
	}
};

Pageboard.elements.break = {
	title: 'Break',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icon cut"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="page-break"></div>`;
	}
};

Pageboard.elements.nobreak = {
	title: 'Avoid',
	menu: "pdf",
	group: 'block',
	context: 'pdf//',
	icon: '<i class="icons"><i class="blue dont icon"></i><i class="icon cut"></i></i>',
	contents: {
		content: {
			spec: "block+"
		}
	},
	render: function(doc, block) {
		return doc.dom`<div class="page-nobreak" block-content="content"></div>`;
	}
};
