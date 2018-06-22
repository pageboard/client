Pageboard.elements.mail = {
	priority: -100,
	replaces: 'doc',
	title: 'Mail',
	group: 'page',
	standalone: true, // besides site, can be child of zero or more parents
	properties: {
		title: {
			title: 'Title',
			type: ['string', 'null'],
			input: {
				name: 'pageTitle'
			}
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "^(/[a-zA-Z0-9-.]*)+$", // notice the absence of underscore
			input: {
				// works with sitemap editor to update pages url in a coherent manner
				// see also page.save: the href updater will only change input.name == "href".
				name: 'pageUrl'
			}
		}
	},
	contents: {
		body: {
			spec: 'mail_block+',
			title: 'body'
		}
	},
	icon: '<i class="icon file outline"></i>',
	render: function(doc, block) {
		var d = block.data;
		var title = doc.head.querySelector('title');
		if (!title) {
			title = doc.createElement('title');
			doc.head.insertBefore(title, doc.head.firstChild);
		}
		var site = Pageboard.site;
		if (site) {
			if (site.lang) {
				doc.documentElement.lang = site.lang;
			}
		} else {
			console.warn("no site set");
		}
		title.textContent = d.title || '';
		doc.body.innerHTML = `<table class="container" align="center">
		<tr>
			<td block-content="body"></td>
		</tr>
	</table>`;
		return doc.body;
	},
	scripts: Pageboard.elements.page.scripts.slice(0, 3),
	stylesheets: [
		'../lib/foundation-emails.css',
		'../ui/mail.css'
	]
};

