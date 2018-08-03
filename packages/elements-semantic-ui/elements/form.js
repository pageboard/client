/*
TODO use matchdom to map values from query to input values:
- query_form: the ones that are changing the url often need to map id to produit
- submission_form: some of them need to set an hidden input from a query value
*/
Pageboard.elements.query_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Query Form',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	properties: {
		query: {
			title: 'Target query',
			description: 'Query block that will consume the query parameters',
			type: 'string',
			pattern: '^[\\w-]+$',
			input: {
				name: 'find',
				type: 'query'
			}
		},
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			type: ['null', 'string'],
			input: {
				name: 'element'
			}
		},
		live: { // TODO submit on input if no elements are required ?
			title: 'Submit on input',
			type: 'boolean',
			default: true
		}
	},
	contents: {
		form: {
			spec: 'block+'
		}
	},
	html: `<form action="[url]" method="get" class="ui form" data-live="[live|not]" data-type="[type]">
		<div block-content="form"></div>
	</form>`,
	stylesheets: [
		'../semantic-ui/form.css',
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
	title: 'Api Form',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	required: ["api", "name"],
	properties: {
		name: {
			title: 'Name',
			description: 'The form id used to track state in address bar',
			type: 'string',
			pattern: '[a-zA-Z]\\w*'
		},
		api: {
			title: 'Api call',
			type: "string",
			pattern: "^(\\w+\.\\w+)?$"
		},
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			type: ['null', 'string'],
			input: {
				name: 'element'
			}
		},
		redirection: {
			title: 'Redirection',
			description: 'Optional after successful submission',
			anyOf: [{
				type: "null"
			}, {
				type: 'object',
				properties: {
					url: {
						title: 'Address',
						anyOf: [{
							type: "null"
						}, {
							type: "string",
							pattern: "^(/[a-zA-Z0-9-.]*)+$"
						}],
						input: {
							name: 'href',
							filter: {
								type: ["link"]
							}
						}
					},
					query: {
						title: 'Query',
						description: 'keys-values (const or $query.<path>)',
						anyOf: [{
							type: "object"
						}, {
							type: "null"
						}]
					}
				}
			}]
		}
	},
	contents: {
		form: {
			spec: 'block+'
		}
	},
	html: `<form action="/.api/form" type="[type]"
		method="post"
		class="ui form"
		id="[name|or:[$id|slice:0:4]]"
	>
		<input type="hidden" name="_id" value="[$id]" />
		<div block-content="form"></div>
	</form>`,
	stylesheets: [
		'../semantic-ui/form.css',
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
		'../semantic-ui/message.css'
	]
};
