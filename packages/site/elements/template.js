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
		action="/.api/query/[$id][action.method|bmagnet]"
		parameters="[$expr.action.parameters|templates:$query]"
		success="[redirection|urlQuery]"
		badrequest="[badrequest|urlQuery]"
		unauthorized="[unauthorized|urlQuery]"
		notfound="[notfound|urlQuery]"
	>
		<template block-content="template"></template>
		<div class="view"></div>
	</element-template>`,
	properties: {
		action: {
			title: 'Action',
			type: 'object',
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
	html: `<element-include data-action="/.api/query/[$id]">
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
	html: `<span
		data-attr="[attr|trim|split:%0A|join:%7C|pre:%5B|post:%5D]"
		data-label="[fill|split:%0A|slice:0:1|join:|split:.|slice:-1|join:|or: ]"
	>[fill|trim|split:%0A|join:%7C|pre:%5B|post:%5D]</span>`
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
	html: '<element-content block-content="[name]" data-filter="[filter]">[fill|trim|split:%0A|join:%7C|pre:%5B|post:%5D]</element-content>',
	scripts: [
		'../ui/content.js'
	]
};

