Pageboard.elements.nav = {
	title: "Nav",
	icon: '<i class="icon hand pointer"></i>',
	menu: "link",
	description: "Navigation links",
	properties: {
		relation: {
			title: "relation",
			default: "up",
			anyOf: [{
				const: "up",
				title: "up"
			}, {
				const: "prev",
				title: "previous"
			}, {
				const: "next",
				title: "next"
			}]
		}
	},
	group: "block",
	html: `<a class="ui icon button [url|!?:disabled]" href="[url]" title="[title]">
		<i class="icon [rel]"></i>
	</a>`,
	fuse: function(node, d, scope) {
		var obj = (scope.$links || {})[d.relation] || {};
		if (d.relation == "up") {
			if (obj.length) obj = obj[0];
		}
		node.fuse({
			url: obj.url,
			title: obj.title,
			rel: d.relation,
		}, scope);
	}
};

Pageboard.elements.breadcrumb = {
	title: "Breadcrumb",
	icon: '<b class="icon">&gt;&gt;&gt;</b>',
	menu: "link",
	group: "block",
	html: `<div class="ui breadcrumb">
		<div class="divider"></div>
		<a href="[$links.up.url|repeat:+a:link]" class="section">[link.title]</a>
		<div class="divider"></div>
		<div class="active section">[$doc.title]</div>
	</div>`,
	stylesheets: [
		'../semantic-ui/breadcrumb.css'
	]
};

