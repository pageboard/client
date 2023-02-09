exports.query_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Form Query',
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
	contents: 'block+',
	tag: 'form[method="get"]',
	html: `<form is="element-form" method="get" name="[name]"
		action="[redirection.url][redirection.parameters|query|url]"
		autocomplete="off" class="ui form"></form>`,
	stylesheets: [
		'../lib/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../lib/formdata.js',
		'../ui/form.js'
	],
	polyfills: ['fetch'] // unfortunately there is no formdata polyfill available right now
};

exports.api_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Form Submit',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	required: ["action"],
	expressions: true,
	$lock: {
		'data.action.parameters': 'webmaster'
	},
	properties: {
		hidden: {
			title: 'Hidden',
			type: 'boolean',
			default: false,
			context: 'template'
		},
		name: {
			title: 'Name',
			description: 'Use with form.submit=name to autosubmit',
			type: 'string',
			format: 'id',
			nullable: true
		},
		action: {
			title: 'Action',
			type: 'object',
			required: ["method"],
			properties: {
				method: {
					title: 'Method',
					nullable: true,
					type: "string",
					pattern: /^(\w+\.\w+)?$/.source
				},
				parameters: {
					title: 'Parameters',
					nullable: true,
					type: "object"
				}
			},
			$filter: {
				name: 'service',
				action: "write"
			},
			$helper: 'service',
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
	html: `<form is="element-form" method="post" name="[name]"
		action="/.api/form/[$id]"
		parameters="[$expr?.action?.parameters|templates:$query]"
		success="[redirection|urltpl:url:parameters]"
		badrequest="[badrequest|urltpl:url:parameters]"
		unauthorized="[unauthorized|urltpl:url:parameters]"
		notfound="[notfound|urltpl:url:parameters]"
		class="ui form [hidden]"></form>`,
	stylesheets: [
		'../lib/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../lib/formdata.js',
		'../ui/form.js'
	],
	polyfills: ['fetch'] // unfortunately there is no formdata polyfill available right now
};

