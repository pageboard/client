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
	expressions: true,
	$lock: {
		'data.action.parameters': 'webmaster'
	},
	properties: {
		name: {
			title: 'Name',
			description: "Used by query 'submit' or 'toggle'\nExposes /@api/form/$name",
			type: 'string',
			format: 'id',
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
		request: {
			title: 'Map inputs',
			description: `
				expr is supposed to be used to merge stuff into html,
				not really to merge stuff into methods parameters
				Also expr has a bad design because
			  - it can be replaced by a binding element inside the block
				- it forces the expression to be in a specific attribute,
				  and mostly when a block has no content (so a binding cannot be used)
				- the editor is ugly and shows fields that might not even be merged into html
				Use cases
				- links in anchors, images
				- input or buttons values, checked attributes
				- hidden attributes
				- show/hide blocks depending on response
				The "expr" mecanism could instead be a list of expressions like
				[url|as:url|assign:.query.reservation:$query.reservation]
				[url][$query|pick:text:cover|as:query]

				Things to solve:
				- do we want expr to be able to do changes outside the DOM of the block itself ? (no, this should be done by a binding element)
				- do we want expr to change only data before merge - outside of any dom context ? Possibly ! In which case the current system is not that bad,
				but it should not use matchdom dom plugin at all
				- how to deal with "template" expressions when one cannot insert a binding
				element ? Is it really something that happens ?



			`,
			type: 'object',
			nullable: true
		},
		response: {
			title: 'Map outputs',
			description: `
				'item.id': '[item.data.id]'
				'item.title': '[item.content.title]'
				// etc...
			`,
			type: 'object',
			nullable: true
		},
		redirection: {
			title: 'Success',
			description: `
				redirection can be used by client,
				to change the page state. In which case the "url" is not an api url.
				It can be used by the server, in which case the "url" is an api url.
				The parameters for a page url make the query, and $query, $request, $response are available.
				The parameters for a user api call are...?
				The user api endpoint is a real url (/@api/xxx) that can expect
				a body ($request) and a query ($query) too.
				Currently client pages use a trick to redirect and submit: a specific parameter triggers a form submit on the redirected page. This makes sense in the context of page navigation - the body is filled by the form that is triggered by the parameters.
				How can that be transposed for internal user api redirection ?
				1. since it redirects, output mapping can be done to format the $response
				2. in the next api call, parameters mean $query, $response becomes $request ?
				3. this works if output can merge $query, $request as well
			`,
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
	html: `<form is="element-form" method="post" name="[name]" masked="[masked]"
		action="/@api/form/[name|else:$id]"
		parameters="[$expr?.action?.parameters|as:expressions]"
		success="[redirection.url][redirection.parameters|as:query]"
		badrequest="[badrequest.url][badrequest.parameters|as:query]"
		unauthorized="[unauthorized.url][unauthorized.parameters|as:query]"
		notfound="[notfound.url][notfound.parameters|as:query]"
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

