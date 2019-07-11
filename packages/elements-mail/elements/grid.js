// https://foundation.zurb.com/emails/docs

exports.mail_row = {
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
		id: 'columns',
		nodes: "mail_column_first mail_column* mail_column_last mail_column_expander"
	},
	group: "mail_block",
	html: `<table class="row [collapse|?]">
		<tr block-content="columns"></tr>
	</table>`
};

exports.mail_column_first = {
	title: 'First Column',
	group: "mail_block",
	contents: "mail_block+",
	html: '<th class="small-12 large-6 columns first"></th>'
};

exports.mail_column_last = {
	title: 'Last Column',
	group: "mail_block",
	contents: "mail_block+",
	html: '<th class="small-12 large-6 columns last"></th>'
};

exports.mail_column_expander = {
	group: "mail_block",
	html: '<th class="expander"></th>'
};

exports.mail_column = {
	group: "mail_block",
	title: "Column",
	icon: '<b class="icon">Cl</b>',
	contents: "mail_block+",
	html: '<th class="small-12 large-6 columns"></th>'
};
