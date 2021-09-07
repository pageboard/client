exports.user = {
	title: 'User',
	priority: -10,
	bundle: true,
	required: ['email'],
	$lock: true,
	properties: {
		email: {
			title: 'Email',
			type: 'string',
			format: 'email',
			transform: ['trim', 'toLowerCase']
		},
		name: {
			title: 'Name',
			type: 'string',
			nullable: true,
			format: 'singleline'
		}
	}
};

exports.priv = {
	title: 'Private',
	priority: -10,
	$lock: true,
	properties: {
		otp: {
			type: 'object',
			properties: {
				secret: {
					type: 'string'
				},
				checked_at: {
					nullable: true,
					type: 'string',
					format: 'date-time'
				},
				tries: {
					type: 'integer',
					default: 0
				}
			}
		}
	},
	parents: {
		type: 'array',
		items: [{
			type: 'object',
			properties: {
				type: {
					title: 'user',
					const: 'user'
				},
				id: {
					title: 'id',
					type: 'string',
					format: 'id'
				}
			}
		}]
	}
};

exports.settings = {
	title: 'Settings',
	priority: -10,
	bundle: 'user',
	properties: {
		consents: {
			title: 'User Consents',
			type: 'object',
			properties: {
				mandatory: {
					title: 'Mandatory Contacts',
					type: 'boolean',
					default: false
				},
				extra: {
					title: 'Extra Contacts',
					type: 'boolean',
					default: false
				}
			}
		},
		grants: {
			title: 'Grants',
			type: 'array',
			uniqueItems: true,
			items: {
				anyOf: [{
					const: 'root',
					$level: 1,
					title: 'Root',
					description: 'anything'
				}, {
					const: 'owner',
					$level: 10,
					title: 'Owner',
					description: 'site owner'
				}, {
					const: 'webmaster',
					$level: 100,
					title: 'Webmaster',
					description: 'site developer'
				}, {
					const: 'writer',
					$level: 1000,
					title: 'Writer',
					description: 'content editor'
				}, {
					const: 'user',
					$level: 10000,
					title: 'User',
					description: 'public user'
				}]
			}
		}
	},
	parents: {
		type: 'array',
		items: [{
			type: 'object',
			properties: {
				type: {
					title: 'user',
					const: 'user'
				},
				id: {
					title: 'id',
					type: 'string',
					format: 'id'
				}
			}
		}]
	}
};

exports.site = {
	title: 'Site',
	priority: -1000,
	$lock: true,
	bundle: true,
	properties : {
		title: {
			title: 'Site title',
			nullable: true,
			type: "string"
		},
		domains: {
			title: 'Domain names',
			description: 'The main domain and the redirecting ones if any',
			nullable: true,
			type: "array",
			items: {
				type: "string",
				format: 'hostname'
			}
		},
		author: {
			title: 'Author',
			nullable: true,
			type: "string",
			format: "singleline"
		},
		license: {
			title: 'License',
			nullable: true,
			type: "string",
			format: "singleline"
			// TODO use spdx.org/licenses for choosing a license
		},
		lang: {
			title: 'Language',
			nullable: true,
			type: "string",
			format: "singleline"
		},
		module: {
			title: 'Module name',
			nullable: true,
			type: "string",
			format: "singleline"
		},
		version: {
			title: 'Module version',
			description: 'Semantic version or git tag or commit',
			nullable: true,
			type: "string",
			format: "singleline" // a "version" format ?
		},
		server: {
			title: 'Server version',
			description: 'Major.minor pageboard server version',
			nullable: true,
			pattern: '^\\d+\\.\\d+$'
		},
		maintenance: {
			title: 'Maintenance',
			description: 'Site-wide read-only mode',
			type: "boolean",
			nullable: true
		},
		env: {
			title: 'Environment',
			anyOf: [{
				const: 'dev',
				title: 'Development'
			}, {
				const: 'staging',
				title: 'Staging'
			}, {
				const: 'production',
				title: 'Production'
			}],
			default: 'dev'
		},
		favicon: {
			title: 'Favicon',
			nullable: true,
			type: "string",
			format: "pathname",
			$helper: {
				name: 'href',
				display: 'icon',
				filter: {
					type: ["image", "svg"],
					maxSize: 20000,
					maxWidth: 320,
					maxHeight: 320
				}
			}
		}
	},
	scripts: [
		"../lib/window-page.js",
		"../lib/pageboard.js",
		"../ui/route.js"
	]
};
