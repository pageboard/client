exports.tabs = {
	title: "Tabs",
	icon: '<b class="icon">Tabs</b>',
	menu: 'widget',
	group: "block",
	properties: {
		name: {
			title: 'Name',
			type: 'string',
			format: 'id',
			nullable: true
		}
	},
	contents: [{
		id: 'items',
		title: 'Menu',
		nodes: "tab_item+"
	}, {
		id: 'tabs',
		title: 'Tabs',
		nodes: "tab+"
	}],
	html: `<element-tabs id="[name|as:xid]">
		<div class="ui top attached tabular menu" block-content="items"></div>
		<div class="tabs" block-content="tabs"></div>
	</element-tabs>`,
	stylesheets: [
		'../ui/components/tab.css',
		'../ui/tab.css'
	],
	scripts: [
		'../ui/tab.js'
	]
};
exports.editor?.scripts.push('../ui/tab-helper.js');

exports.tab_item = {
	title: "Item",
	icon: '<i class="icons"><b class="icon">Tab</b><i class="corner add icon"></i></i>',
	menu: 'widget',
	context: 'tabs_container_items/',
	contents: "inline*",
	tag: 'a.item',
	html: '<a class="item">Tab Item</a>'
};

exports.tab = {
	title: 'Tab',
	inplace: true,
	context: 'tabs_container_tabs/',
	contents: "block+",
	tag: 'div.tab.segment', // ignore .bottom.attached
	html: '<div class="ui bottom attached tab segment"></div>'
};

