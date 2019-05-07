exports.mail_spacer = {
	title: "Spacer",
	icon: '<b class="icon">Sp</b>',
	properties: {
		height: {
			type: 'integer',
			title: 'Height',
			default: 100,
			minimum: 10
		}
	},
	group: "mail_block",
	html: `<table class="spacer">
		<tbody>
			<tr>
				<td height="[height|post:px]" style="font-size:[height|post:px];line-height:[height|post:px];">&#xA0;</td>
			</tr>
		</tbody>
	</table>`
};

