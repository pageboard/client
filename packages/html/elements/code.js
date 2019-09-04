exports.code = {
	title: "Literal",
	icon: '<i class="left quote icon"></i>',
	inline: true,
	inplace: true,
	group: "nolink",
	contents: "text*",
	html:`<code></code>`
};

exports.code_block = {
	title: "Code",
	icon: '<i class="left quote icon"></i>',
	group: "block",
	contents: {
		id: 'text',
		nodes: 'inline*'
	},
	code: true,
	preserveWhitespace: 'full',
	tag: 'pre',
	html:`<pre><code block-content="text"></code></pre>`
};
