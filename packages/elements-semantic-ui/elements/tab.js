exports.tabs = {
	title: "Tabs",
	icon: '<b class="icon">Tabs</b>',
	menu: 'widget',
	group: "block",
	contents: [{
		id: 'items',
		title: 'Menu',
		nodes: "tab_item+"
	}, {
		id: 'tabs',
		title: 'Tabs',
		nodes: "tab+"
	}],
	html: `<element-tabs>
		<div class="ui top attached tabular menu" block-content="items"></div>
		<div block-content="tabs"></div>
	</element-tabs>`,
	stylesheets: [
		'../lib/components/tab.css',
		'../ui/tab.css'
	],
	scripts: [
		'../ui/tab.js'
	],
	resources: {
		helper: '../ui/tab-helper.js'
	},
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources.helper, scope);
	}
};


exports.tab_item = {
	title: "Item",
	icon: '<i class="icons"><b class="icon">Tab</b><i class="corner add icon"></i></i>',
	menu: 'widget',
	inplace: true,
	context: 'tabs_container_items/',
	contents: "inline*",
	html: '<a class="item">Tab Item</a>'
};

exports.tab = {
	title: 'Tab',
	inplace: true,
	context: 'tabs_container_tabs/',
	contents: "block+",
	html: '<div class="ui bottom attached tab segment"></div>'
};

