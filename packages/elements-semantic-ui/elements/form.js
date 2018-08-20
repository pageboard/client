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
		url: {
			title: 'Target page',
			description: 'Can be empty to stay on same page',
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
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			type: ['null', 'string'],
			input: {
				name: 'element'
			}
		}
	},
	contents: {
		form: {
			spec: 'block+'
		}
	},
	html: `<form class="ui form" action="[url]" method="get" data-type="[type]">
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
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			type: ['null', 'string'],
			input: {
				name: 'element'
			}
		},
		request: {
			title: 'Request',
			type: 'object',
			properties: {
				method: {
					title: 'Method',
					type: "string",
					pattern: "^(\\w+\.\\w+)?$"
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
				},
				input: {
					name: 'service',
					filter: {
						type: "submit"
					}
				}
			}
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
