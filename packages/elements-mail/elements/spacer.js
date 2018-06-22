Pageboard.elements.mail_spacer = {
	title: "Spacer",
	properties: {
		height: {
			type: 'integer',
			title: 'Height',
			default: 100,
			minimum: 10
		}
	},
	group: "mail_block",
	icon: '<b class="icon">spac</b>',
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<table class="spacer">
			<tbody>
				<tr>
					<td height="${d.height}px" style="font-size:${d.height}px;line-height:${d.height}px;">&#xA0;</td>
				</tr>
			</tbody>
		</table>`;
	}
};

