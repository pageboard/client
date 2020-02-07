exports.query_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Form Query',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	properties: {
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			nullable: true,
			type: 'string',
			format: 'id',
			$filter: {
				name: 'element',
				contentless: true,
				standalone: true
			}
		},
		redirection: {
			title: 'Redirection',
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
			}
		}
	},
	contents: 'block+',
	tag: 'form[method="get"]',
	html: `<form is="element-form" method="get"
		redirection="[redirection.url][redirection.parameters|query|url]"
		class="ui form"></form>`,
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
		action: {
			title: 'Action',
			type: 'object',
			required: ["method"],
			properties: {
				method: {
					title: 'Method',
					nullable: true,
					type: "string",
					pattern: "^(\\w+\\.\\w+)?$"
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
			title: 'Redirection',
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
			}
		}
	},
	contents: 'block+',
	tag: 'form[method="post"]',
	html: `<form is="element-form" method="post"
		action="/.api/form/[$id]"
		redirection="[redirection.url][redirection.parameters|query]"
		class="ui form [hidden|?]"></form>`,
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

