Pageboard.elements.mail_button = {
	title: "Button",
	contents: {
		text: "text*",
	},
	group: "mail_block",
	icon: '<b class="icon">Bt</b>',
	properties: {
		url: {
			title: 'Address',
			description: 'Path without query or full url',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
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
	render: function(doc, block) {
		var d = block.data;
		var node = doc.dom`<table class="button"><tr><td><table>
			<tr>
				<td><a href="${d.url || '#'}" block-content="text">Button</a></td>
			</tr>
		</table></td></tr></table>`;
		if (d.label) node.classList.add(d.label);
		if (d.size) node.classList.add(d.size);
		if (d.expanded) node.classList.add('expanded');
		if (d.radius) node.classList.add('radius');
		if (d.rounded) node.classList.add('rounded');
		return node;
	}
};

