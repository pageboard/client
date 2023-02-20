exports.fetch = {
	priority: 1,
	title: "Fetch",
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
		disabled="[disabled]"
		action="/.api/query/[$id][action?.method|prune:-]"
		data-auto="[action?.auto]"
		data-pagination="[$expr?.action?.parameters?.offset|templates:$query]"
		parameters="[$expr?.action?.parameters|templates:$query:$pathname]"
		success="[redirection|urltpl:url:parameters]"
		badrequest="[badrequest|urltpl:url:parameters]"
		unauthorized="[unauthorized|urltpl:url:parameters]"
		notfound="[notfound|urltpl:url:parameters]"
	>
		<template block-content="template"></template>
	</element-template>`,
	properties: {
		disabled: {
			title: 'Disabled',
			description: 'Disable action using template expression',
			type: 'boolean',
			default: false
		},
		action: {
			title: 'Action',
			type: 'object',
			properties: {
				method: {
					title: 'Method',
					nullable: true,
					type: "string",
					pattern: /^(\w+\.\w+)?$/.source
				},
				auto: {
					title: 'Auto fetch on scroll',
					type: 'boolean',
					nullable: true
				},
				parameters: {
					title: 'Parameters',
					nullable: true,
					type: "object"
				}
			},
			nullable: true,
			$filter: {
				name: 'service',
				action: "read"
			},
			$helper: 'service'
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

exports.include = {
	priority: 2,
	title: "Include",
	menu: 'form',
	group: 'block template',
	icon: '<i class="search icon"></i>',
	expressions: true,
	required: ['action'],
	properties: exports.fetch.properties,
	contents: [{
		id: 'messages',
		nodes: 'message+'
	}, {
		id: 'blocks',
		nodes: "block+",
		virtual: true
	}],
	html: `<element-include
		action="/.api/query/[$id]"
		parameters="[$expr?.action?.parameters|templates:$query]"
	>
		<div block-content="messages"></div>
		<div block-content="blocks"></div>
	</element-include>`,
	scripts: [
		'../ui/include.js'
	]
};

exports.binding = {
	title: "Binding",
	icon: '<i class="asterisk icon"></i>',
	properties: {
		fill: {
			title: 'Fill',
			description: 'fill content with matchdom expression, filters on new lines',
			type: 'string'
		},
		attr: {
			title: 'Attribute',
			description: 'set attributes with matchdom expression, filters on new lines',
			type: 'string'
		}
	},
	context: 'template//',
	inline: true,
	group: "inline nolink",
	tag: 'span[block-type="binding"]',
	html: `<span
		data-attr="[attr|as:binding]"
		data-label="[fill|parts:%0A:0:1|.first|parts:.:-1|.last|or:#]"
	>[fill|as:binding]</span>`
};

exports.block_binding = {
	...exports.binding,
	inline: false,
	group: "block",
	tag: 'div[block-type="block_binding"]',
	html: `<div
		data-attr="[attr|as:binding]"
		data-label="[fill|parts:%0A:0:1|.first|parts:.:-1|.last|or:#]"
	>[fill|as:binding]</div>`
};

exports.content = {
	title: "Content",
	icon: '<i class="square outline icon"></i>',
	menu: "form",
	group: 'block',
	context: 'template//',
	properties: {
		name: {
			title: 'Name',
			description: 'Must match element content name',
			type: 'string',
			format: "id",
			// $helper: {
			// 	name: 'element-content',
			// 	standalone: true
			// }
		},
		fill: {
			title: 'Fill',
			description: 'Fill with template expression',
			type: 'string'
		},
		filter: {
			title: 'Filter',
			description: 'by CSS selector',
			type: 'string',
			nullable: true
		}
	},
	html: '<element-content block-content="[name]" data-filter="[filter]">[fill|as:binding]</element-content>',
	scripts: [
		'../ui/content.js'
	]
};

