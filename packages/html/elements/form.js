exports.query_form = {
	title: 'Form Query',
	priority: 0, // scripts must run before 'query' scripts
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	properties: {
		name: {
			title: 'Name',
			description: 'Useful for query tags',
			type: 'string',
			format: 'id',
			nullable: true
		},
		masked: {
			title: 'Masked',
			description: 'Hidden and disabled, unmasked by $query.toggle',
			type: 'boolean',
			default: false
		},
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			nullable: true,
			type: 'string',
			format: 'name',
			$filter: {
				name: 'element',
				contentless: true,
				standalone: true
			}
		},
		redirection: {
			title: 'Target Address',
			type: 'object',
			properties: {
				url: {
					title: 'Page',
					nullable: true,
					type: "string",
					format: "page",
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
	contents: 'block+',
	tag: 'form[method="get"]',
	html: `<form is="element-form" method="get" name="[name]" masked="[masked]"
		action="[redirection.url][redirection.parameters|as:query]"
		autocomplete="off" class="ui form"></form>`,
	stylesheets: [
		'../ui/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../ui/form.js'
	],
	polyfills: ['fetch']
};

exports.api_form = {
	title: 'Form Submit',
	priority: 0, // scripts must run before 'query' scripts
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	required: ["action"],
	unique: ["name"],
	expressions: true,
	$lock: {
		'data.action.parameters': 'webmaster'
	},
	properties: {
		name: {
			title: 'Name',
			description: "Exposes /@api/$name\nUsed by query 'submit' or 'toggle'",
			type: 'string',
			format: 'name',
			nullable: true
		},
		hidden: {
			title: 'Hidden',
			type: 'boolean',
			default: false,
			context: 'template'
		},
		masked: {
			title: 'Masked',
			description: 'Hidden and disabled, unmasked by $query.toggle',
			type: 'boolean',
			default: false
		},
		action: {
			title: 'Action',
			description: 'Choose a service',
			$ref: '/writes'
		},
		redirection: {
			title: 'Success',
			description: 'Page state or action',
			type: 'object',
			properties: {
				name: {
					title: 'Form or Fetch Name',
					nullable: true,
					type: 'string',
					format: 'singleline'
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
					format: 'singleline'
				},
				parameters: {
					title: 'Parameters',
					type: "object",
					nullable: true
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
					format: 'singleline'
				},
				parameters: {
					title: 'Parameters',
					type: "object",
					nullable: true
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
					format: 'singleline'
				},
				parameters: {
					title: 'Parameters',
					type: "object",
					nullable: true
				}
			},
			nullable: true
		}
	},
	contents: 'block+',
	tag: 'form[method="post"]',
	html: `<form is="element-form" method="post" name="[name]" masked="[masked]"
		action="/@api/form/[name|else:$id]"
		parameters="[action?.request|as:expressions]"
		success="[redirection.parameters|as:query]"
		badrequest="[badrequest.parameters|as:query]"
		unauthorized="[unauthorized.parameters|as:query]"
		notfound="[notfound.parameters|as:query]"
		class="ui form [hidden]"></form>`,
	stylesheets: [
		'../ui/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../ui/form.js'
	],
	polyfills: ['fetch', 'FormDataSubmitter']
};

