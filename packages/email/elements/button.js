exports.mail_button = {
	title: "Button",
	icon: '<b class="icon">Bt</b>',
	contents: {
		id: 'text',
		nodes: "mail_inline*",
	},
	group: "mail_block",
	properties: {
		url: {
			title: 'Address',
			description: 'Path without query or full url',
			nullable: true,
			type: 'string',
			format: 'uri-reference',
			$helper: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		},
		label: {
			title: 'Label',
			anyOf: [{
				type:'null',
				title:'None'
			}, {
				const: 'secondary',
				title: 'Secondary'
			}, {
				const: 'success',
				title: 'Success'
			}, {
				const: 'warning',
				title: 'Warning'
			}, {
				const: 'alert',
				title: 'Alert'
			}]
		},
		size: {
			title: 'Size',
			anyOf: [{
				type:'null',
				title:'Default'
			}, {
				const: 'tiny',
				title: 'Tiny'
			}, {
				const: 'small',
				title: 'Small'
			}, {
				const: 'large',
				title: 'Large'
			}]
		},
		expanded: {
			title: 'Expanded',
			type: 'boolean',
			default: false
		},
		radius: {
			title: 'Radius',
			type: 'boolean',
			default: false
		},
		rounded: {
			title: 'Rounded',
			type: 'boolean',
			default: false
		}
	},
	html: `<table class="button [label] [size]
		[expanded] [radius] [rounded]"
	><tr><td><table>
		<tr>
			<td><a href="[url|or:%23]" block-content="text">Button</a></td>
		</tr>
	</table></td></tr></table>`
};

