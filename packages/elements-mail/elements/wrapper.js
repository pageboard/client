Pageboard.elements.mail_wrapper = {
	title: "Wrapper",
	contents: {
		content: {
			spec: "mail_block+",
			title: 'content'
		}
	},
	group: "mail_block",
	icon: '<b class="icon">Wr</b>',
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<table class="wrapper" align="center">
			<tr>
				<td class="wrapper-inner" block-content="content"></td>
			</tr>
		</table>`;
	}
};

