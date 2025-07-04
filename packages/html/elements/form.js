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
			format: 'name',
			nullable: true
		},
		hidden: {
			title: 'Hidden',
			description: 'Hidden and disabled\nShown by $query.toggle',
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
			title: 'Target',
			type: 'object',
			properties: {
				url: {
					title: 'Address',
					nullable: true,
					type: "string",
					format: 'uri-reference',
					$helper: {
						name: 'href',
						filter: {
							type: ["link", "file", "archive"]
						}
					}
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
	html: `<form is="element-form" method="get" id="[name|else:$id]" hidden="[hidden]"
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
			description: 'Hidden and disabled\nShown by $query.toggle',
			type: 'boolean',
			default: false
		},
		action: {
			title: 'Action',
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
				},
				grant: {
					title: 'Grant',
					nullable: true,
					type: 'string',
					format: 'grant'
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
	html: `<form is="element-form" method="post" hidden="[hidden]"
		id="[name|else:$id]"
		action="/@api/form/[$id]"
		parameters="[action?.request|as:expressions]"
		success="[redirection.parameters|as:query|as:null]"
		badrequest="[badrequest.parameters|as:query|as:null]"
		unauthorized="[unauthorized.parameters|as:query|as:null]"
		notfound="[notfound.parameters|as:query|as:null]"
		class="ui form"></form>`,
	stylesheets: [
		'../ui/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../ui/form.js'
	],
	polyfills: ['fetch', 'FormDataSubmitter']
};

