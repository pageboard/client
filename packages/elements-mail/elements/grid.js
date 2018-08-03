// https://foundation.zurb.com/emails/docs

Pageboard.elements.mail_row = {
	title: "Row",
	icon: '<b class="icon">Rw</b>',
	properties: {
		collapse: {
			type:'boolean',
			title: 'Collapse',
			default: false
		}
	},
	contents: {
		columns: {
			spec: "mail_column_first mail_column* mail_column_last mail_column_expander",
			title: 'Columns'
		}
	},
	group: "mail_block",
	html: `<table class="row [collapse|?]">
		<tr block-content="columns"></tr>
	</table>`
};

Pageboard.elements.mail_column_first = {
	title: 'First Column',
	group: "mail_block",
	contents: {
		content: {
			spec: "mail_block+",
			title: 'content'
		}
	},
	html: '<th class="small-12 large-6 columns first" block-content="content"></th>'
};

Pageboard.elements.mail_column_last = {
	title: 'Last Column',
	group: "mail_block",
	contents: {
		content: {
			spec: "mail_block+",
			title: 'content'
		}
	},
	html: '<th class="small-12 large-6 columns last" block-content="content"></th>'
};

Pageboard.elements.mail_column_expander = {
	group: "mail_block",
	html: '<th class="expander"></th>'
};

Pageboard.elements.mail_column = {
	group: "mail_block",
	title: "Column",
	icon: '<b class="icon">Cl</b>',
	contents: {
		content: {
			spec: "mail_block+",
			title: 'content'
		}
	},
	html: '<th class="small-12 large-6 columns" block-content="content"></th>'
};
