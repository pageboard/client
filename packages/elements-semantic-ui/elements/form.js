Pageboard.elements.query_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Form Query',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	properties: {
		url: {
			title: 'Target page',
			description: 'Can be empty to stay on same page',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "pathname"
			}],
			$helper: {
				name: 'href',
				filter: {
					type: ["link"]
				}
			}
		},
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			anyOf: [{
				type: 'null'
			}, {
				type: 'string',
				format: 'id'
			}],
			$helper: 'element'
		}
	},
	contents: {
		form: {
			spec: 'block+'
		}
	},
	tag: 'form[method="get"]',
	html: `<form is="element-form" class="ui form" action="[url]" method="get" data-type="[type]">
		<div block-content="form"></div>
	</form>`,
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

Pageboard.elements.api_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Form Submit',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	required: ["request"],
	properties: {
		name: {
			title: 'Name',
			description: 'The form id used to track state in address bar',
			type: 'string',
			pattern: '[a-zA-Z]\\w*'
		},
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			anyOf: [{
				type: 'null'
			}, {
				type: 'string',
				format: 'id'
			}],
			$helper: 'element'
		},
		request: {
			title: 'Request',
			type: 'object',
			required: ["method"],
			properties: {
				method: {
					title: 'Method',
					anyOf: [{
						type: "null"
					}, {
						type: "string",
						pattern: "^(\\w+\\.\\w+)?$"
					}]
				},
				parameters: {
					title: 'Parameters',
					description: 'Key-values', // NB request.parameters temporarily holds $query.<name> pairs
					// they must be moved to hidden input templates !
					anyOf: [{
						type: "object"
					}, {
						type: "null"
					}]
				}
			},
			$filter: {
				name: 'service',
				action: "write"
			},
			$helper: 'service',
		},
		response: {
			title: 'Response',
			description: 'Change location using response',
			type: 'object',
			properties: {
				url: {
					title: 'Target page',
					description: 'Can be empty to stay on same page',
					anyOf: [{
						type: "null"
					}, {
						type: "string",
						format: "pathname"
					}],
					$helper: {
						name: 'href',
						filter: {
							type: ["link"]
						}
					}
				},
				query: {
					title: 'Target query',
					description: 'Use $response.<path> to merge response fields into query',
					type: ['null', 'object']
				}
			}
		}
	},
	contents: {
		form: {
			spec: 'block+'
		}
	},
	tag: 'form[method="post"]',
	html: `<form is="element-form" action="/.api/form/[$id]" type="[type]"
		method="post"
		class="ui form"
		id="[name|or:[$id|slice:0:4]]"
		block-content="form"></form>`,
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

Pageboard.elements.form_message = {
	title: 'Message',
	icon: '<i class="announcement icon"></i>',
	menu: "form",
	group: "block",
	context: 'form//',
	properties: {
		type: {
			title: "type",
			description: "Message is shown depending on type",
			default: "success",
			anyOf: [{
				const: "success",
				title: "Success"
			}, {
				const: "warning",
				title: "Not found"
			}, {
				const: "error",
				title: "Error"
			}]
		}
	},
	contents: {
		message: {
			title: 'Message',
			spec: "block+"
		}
	},
	html: '<div class="ui message [type]" block-content="message">[type|schema:title] message</div>',
	stylesheets: [
		'../lib/components/message.css'
	]
};
