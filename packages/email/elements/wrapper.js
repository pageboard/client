exports.mail_wrapper = {
	title: "Wrapper",
	icon: '<b class="icon">Wr</b>',
	contents: {
		id: 'content',
		nodes: "mail_block+"
	},
	group: "mail_block",
	html: `<table class="wrapper" align="center">
		<tr>
			<td class="wrapper-inner" block-content="content"></td>
		</tr>
	</table>`
};

