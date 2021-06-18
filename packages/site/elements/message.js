exports.message = {
	title: 'Message',
	icon: '<i class="announcement icon"></i>',
	menu: "form",
	group: "block",
	properties: {
		type: {
			title: "Type",
			default: "success",
			anyOf: [{
				const: "success",
				title: "Success"
			}, {
				const: "warning",
				title: "Warning"
			}, {
				const: "error",
				title: "Error"
			}]
		},
		status: {
			title: 'status',
			description: 'Match form response http status code',
			nullable: true,
			anyOf: [
				{
					const: 400,
					title: 'Bad Request'
				}, {
					const: 401,
					title: 'Unauthorized'
				}, {
					const: 402,
					title: 'Payment Required'
				}, {
					const: 403,
					title: 'Forbidden'
				}, {
					const: 404,
					title: 'Not Found'
				}, {
					const: 409,
					title: 'Conflict'
				}
			]
		}
	},
	contents: "block+",
	html: '<div class="message [type]" data-status="[status]"><p>Message</p></div>',
	stylesheets: ['../ui/message.css']
};

