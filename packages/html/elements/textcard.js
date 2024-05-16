exports.textcard = {
	title: 'Text Card',
	group: 'block',
	icon: '<i class="icons"><i class="small heading icon"></i><i class="bottom right corner text cursor icon"></i></i>',
	contents: [{
		id: 'title',
		nodes: "inline*",
		title: 'title'
	}, {
		id: 'content',
		nodes: "inline*",
		title: 'content'
	}],
	html: `<div class="ui textcard">
		<div class="header" block-content="title"></div>
		<div class="content" block-content="content"></div>
	</div>`,
	stylesheets: [
		"../ui/textcard.css"
	]
};
