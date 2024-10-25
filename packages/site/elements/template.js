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
		id="[name|else:$id]"
		action="/@api/query/[$id][action?.method|prune:-]"
		data-auto="[auto]" data-prerender="[prerender]"
		data-offset-name="[action?.request?.offset|as:expressions]"
		data-reactions="[reactions?.length|gt:0|fail:-]"
		parameters="[action?.request|as:expressions]"
		success="[redirection.parameters|as:query|as:null]"
		badrequest="[badrequest.parameters|as:query|as:null]"
		unauthorized="[unauthorized.parameters|as:query|as:null]"
		notfound="[notfound.parameters|as:query|as:null]"
	><template block-content="template"></template></element-template>`,
	unique: ["name"],
	properties: {
		name: {
			title: 'Name',
			description: "Exposes /@api/$name",
			type: 'string',
			format: 'name',
			nullable: true
		},
		auto: {
			title: 'Automatic pagination',
			type: 'boolean',
			default: false
		},
		prerender: {
			title: 'Prerender',
			type: 'boolean',
			default: false
		},
		action: {
			title: 'Action',
			description: 'Choose a service',
			$ref: '/reads'
		},
		reactions: {
			title: 'Reactions',
			description: 'Update when one of these forms are submitted',
			type: 'array',
			items: {
				title: 'Form name',
				type: 'string',
				format: 'name'
			}
		},
		redirection: {
			title: 'Success',
			type: 'object',
			properties: {
				name: {
					title: 'Form or Fetch Name',
					nullable: true,
					type: 'string',
					format: 'name'
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
				name: {
					title: 'Form or Fetch Name',
					nullable: true,
					type: 'string',
					format: 'name'
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
				name: {
					title: 'Form or Fetch Name',
					nullable: true,
					type: 'string',
					format: 'name'
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
				name: {
					title: 'Form or Fetch Name',
					nullable: true,
					type: 'string',
					format: 'name'
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
