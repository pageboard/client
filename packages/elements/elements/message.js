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
				title: "Not found"
			}, {
				const: "error",
				title: "Error"
			}]
		}
	},
	contents: "block+",
	html: '<div class="message [type]"><p>Message</p></div>',
	stylesheets: ['../ui/message.css']
};

