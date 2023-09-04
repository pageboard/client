exports.mail = {
	priority: -100,
	title: 'Mail',
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	dependencies: ['core'],
	bundle: true,
	standalone: true,
	required: ['url'],
	properties: {
		title: {
			title: 'Title',
			nullable: true,
			type: "string",
			format: "singleline",
			$helper: 'pageTitle'
		},
		url: {
			title: 'Address',
			type: "string",
			format: 'page',
			$helper: 'href',
			$filter: {
				name: 'helper',
				helper: 'pageUrl'
			}
		},
		index: {
			type: "integer",
			default: 0,
			minimum: 0
		}
	},
	contents: {
		id: 'body',
		nodes: 'mail_body'
	},
	html: `<html lang="[$lang]">
	<head>
		<title>[$site.title|post:%3A ][title]</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="[$elements.mail.stylesheets|repeat:]" />
		<script defer src="[$elements.mail.scripts|repeat:]"></script>
	</head>
	<body block-content="body"></body>
</html>`,
	scripts: [
		...exports.page.scripts,
		'../lib/inlineresources.js',
		'../lib/europa.js',
		'../lib/juice.js',
		'../ui/mail.js'
	],
	stylesheets: [
		'../lib/foundation-emails.css',
		'../ui/mail.css'
	],
	csp: { ...exports.page.csp },
	mime: 'application/json'
};
exports.sitemail = exports.sitemap?.itemModel('mail', false);

exports.mail_body = {
	title: "Body",
	contents: {
		id: 'content',
		nodes: "mail_block+"
	},
	html: `<table class="body">
		<tr>
			<td block-content="content"></td>
		</tr>
	</table>`
};

exports.mail_container = {
	title: "Container",
	icon: '<b class="icon">Co</b>',
	contents: {
		id: 'content',
		nodes: "mail_block+"
	},
	group: "mail_block",
	html: `<table class="container" align="center">
		<tr>
			<td block-content="content"></td>
		</tr>
	</table>`
};

exports._ = {
	group: "mail_block"
};
