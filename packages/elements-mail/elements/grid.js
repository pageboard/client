// https://foundation.zurb.com/emails/docs

Pageboard.elements.mail_row = {
	title: "Row",
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
	icon: '<b class="icon">row</b>',
	render: function(doc, block) {
		var d = block.data;
		var node = doc.dom`<table class="row">
			<tr block-content="columns"></tr>
		</table>`;
		if (d.collapse) node.classList.add('collapse');
		return node;
	}
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
	render: function(doc, block) {
		return doc.dom`<th class="small-12 large-6 columns first" block-content="content"></th>`;
	}
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
	render: function(doc, block) {
		return doc.dom`<th class="small-12 large-6 columns last" block-content="content"></th>`;
	}
};

Pageboard.elements.mail_column_expander = {
	group: "mail_block",
	render: function(doc, block) {
		return doc.dom`<th class="expander"></th>`;
	}
};

Pageboard.elements.mail_column = {
	group: "mail_block",
	title: "Column",
	contents: {
		content: {
			spec: "mail_block+",
			title: 'content'
		}
	},
	icon: '<b class="icon">col</b>',
	render: function(doc, block) {
		return doc.dom`<th class="small-12 large-6 columns" block-content="content"></th>`;
	}
};
