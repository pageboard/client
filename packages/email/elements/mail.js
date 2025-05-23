exports.mail = {
	title: 'Mail',
	priority: -100,
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	dependencies: ['site'],
	bundle: true,
	standalone: true,
	required: ['url'],
	properties: {
		url: {
			title: 'Address',
			type: "string",
			format: 'page',
			$helper: {
				name: 'href',
				filter: {
					type: ["link"]
				}
			},
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
	contents: [{
		id: 'title',
		nodes: 'text*'
	}, {
		id: 'body',
		nodes: 'mail_body'
	}],
	html: `<html lang="[$lang]">
	<head>
		<title>[$parent.data.title|post:%3A ][$content.title]</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="[$elements.mail.stylesheets|repeat:]" />
		<script defer src="[$elements.mail.scripts|repeat:]"></script>
	</head>
	<body block-content="body"></body>
</html>`,
	scripts: [
		...exports.page.scripts,
		'../lib/europa.js',
		'../ui/mail.js'
	],
	stylesheets: [
		'../lib/foundation-emails.css',
		'../ui/mail.css'
	]
};

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
