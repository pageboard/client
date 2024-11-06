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
			title: 'Status',
			description: 'Match form response http status code',
			anyOf: [
				{
					const: null,
					title: 'Any status'
				}, {
					const: '200',
					title: 'Success'
				}, {
					const: '400',
					title: 'Bad Request'
				}, {
					const: '401',
					title: 'Unauthorized'
				}, {
					const: '402',
					title: 'Payment Required'
				}, {
					const: '403',
					title: 'Forbidden'
				}, {
					const: '404',
					title: 'Not Found'
				}, {
					const: '409',
					title: 'Conflict'
				}
			]
		},
		fading: {
			title: 'Fading',
			type: 'boolean',
			default: false
		}
	},
	contents: "block+",
	html: '<div class="ui message [type]" data-status="[status]" data-fading="[fading]"><p>Message</p></div>',
	stylesheets: ['../ui/message.css']
};
