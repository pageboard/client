exports.mail_wrapper = {
	title: "Wrapper",
	icon: '<b class="icon">Wr</b>',
	contents: {
		content: {
			spec: "mail_block+",
			title: 'content'
		}
	},
	group: "mail_block",
	html: `<table class="wrapper" align="center">
		<tr>
			<td class="wrapper-inner" block-content="content"></td>
		</tr>
	</table>`
};

