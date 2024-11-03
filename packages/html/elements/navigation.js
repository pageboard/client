exports.nav = {
	title: "Nav",
	icon: '<i class="icon hand pointer"></i>',
	menu: "link",
	description: "Navigation links",
	properties: {
		relation: {
			title: "Relation",
			default: "up",
			anyOf: [{
				const: "up",
				title: "Up"
			}, {
				const: "prev",
				title: "Previous"
			}, {
				const: "next",
				title: "Next"
			}]
		}
	},
	group: "block",
	html: `<a class="ui icon button [$links.[relation]|as:array|.first|alt::disabled]" href="[$links.[relation]|as:array|.first.url]" title="[$links.[relation]|as:array|.first.title]"><i class="icon [relation]"></i></a>`
};

exports.scrollLink = {
	title: 'Scroll',
	icon: '<i class="arrows alternate vertical icon"></i>',
	menu: 'link',
	description: 'Scroll Home/End',
	properties: {
		to: {
			title: 'To',
			anyOf: [{
				const: 'home',
				title: 'Home'
			}, {
				const: 'end',
				title: 'End'
			}]
		}
	},
	group: 'block',
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	html: `<a data-to="[to]" is="element-scroll-link"></a>`,
	scripts: ['../ui/scroll-link.js']
};

exports.breadcrumb = {
	title: "Breadcrumb",
	icon: '<b class="icon">&gt;&gt;&gt;</b>',
	menu: "link",
	group: "block",
	html: `<nav class="ui breadcrumb">
		<div class="divider"></div>
		<a href="[$links.up|nth:-1|at:a::1|repeat:link|.url]" class="section">[link.title]</a>
		<div class="divider"></div>
		<div class="active section">[$title|fail:div::1]</div>
	</nav>`,
	stylesheets: [
		'../ui/components/breadcrumb.css'
	]
};

