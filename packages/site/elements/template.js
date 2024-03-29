exports.fetch = {
	title: "Fetch",
	priority: 1,
	icon: '<i class="icons"><i class="search icon"></i><i class="top right corner asterisk icon"></i></i>',
	menu: 'form',
	group: 'block template',
	expressions: true,
	contents: {
		id: 'template',
		nodes: 'block+',
		expressions: true
	},
	html: `<element-template
		action="/.api/query/[name|else:$id][action?.method|prune:-]"
		data-auto="[auto]"
		data-offset-name="[$expr?.action?.parameters?.offset|as:expressions]"
		parameters="[$expr?.action?.parameters|as:expressions]"
		success="[redirection.url][redirection.parameters|as:query]"
		badrequest="[badrequest.url][badrequest.parameters|as:query]"
		unauthorized="[unauthorized.url][unauthorized.parameters|as:query]"
		notfound="[notfound.url][notfound.parameters|as:query]"
	><template block-content="template"></template></element-template>`,
	upgrade: {
		'data.action.auto': 'data.auto'
	},
	properties: {
		name: {
			title: 'Name',
			description: "Exposes /.api/query/$name",
			type: 'string',
			format: 'id',
			nullable: true
		},
		auto: {
			title: 'Automatic pagination',
			type: 'boolean',
			default: false
		},
		action: {
			title: 'Action',
			description: 'Choose a service',
			$ref: '/reads'
		},
		redirection: {
			title: 'Success',
			type: 'object',
			properties: {
				url: {
					title: 'Page',
					nullable: true,
					type: "string",
					format: "pathname",
					$helper: "page"
				},
				parameters: {
					title: 'Parameters',
					nullable: true,
					type: "object"
				}
			},
			nullable: true
		},
		badrequest: {
			title: 'Bad request',
			type: 'object',
			properties: {
				url: {
					title: 'Page',
					nullable: true,
					type: "string",
					format: "pathname",
					$helper: "page"
				},
				parameters: {
					title: 'Parameters',
					nullable: true,
					type: "object"
				}
			},
			nullable: true
		},
		unauthorized: {
			title: 'Unauthorized request',
			type: 'object',
			properties: {
				url: {
					title: 'Page',
					nullable: true,
					type: "string",
					format: "pathname",
					$helper: "page"
				},
				parameters: {
					title: 'Parameters',
					nullable: true,
					type: "object"
				}
			},
			nullable: true
		},
		notfound: {
			title: 'Request not found',
			type: 'object',
			properties: {
				url: {
					title: 'Page',
					nullable: true,
					type: "string",
					format: "pathname",
					$helper: "page"
				},
				parameters: {
					title: 'Parameters',
					nullable: true,
					type: "object"
				}
			},
			nullable: true
		}
	},
	stylesheets: [
		'../ui/template.css'
	],
	scripts: [
		'../ui/template.js'
	]
};

exports.binding = {
	title: "Binding",
	icon: '<i class="asterisk icon"></i>',
	properties: {
		fill: {
			title: 'Fill content',
			description: 'Matchdom expression, one filter by line',
			type: 'string'
		},
		attr: {
			title: 'Fill attribute',
			description: 'Matchdom expression, one filter by line',
			type: 'string'
		}
	},
	context: 'template//',
	inline: true,
	group: "inline nolink",
	tag: 'span[block-type="binding"]',
	html: `<span
		data-attr="[attr|as:binding]"
		data-label="[fill|parts:%0A:0:1|parts:.:-1|or:%23]"
	>[fill|as:binding]</span>`
};

exports.block_binding = {
	...exports.binding,
	inline: false,
	group: "block",
	tag: 'div[block-type="block_binding"]',
	html: `<div
		data-attr="[attr|as:binding]"
		data-label="[fill|parts:%0A:0:1|parts:.:-1|or:%23]"
	>[fill|as:binding]</div>`
};
