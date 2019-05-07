exports.tabs = {
	title: "Tabs",
	icon: '<b class="icon">Tabs</b>',
	menu: 'widget',
	group: "block",
	contents: {
		items: {
			title: 'Menu',
			spec: "tab_item+"
		},
		tabs: {
			title: 'Tabs',
			spec: "tab+"
		}
	},
	properties: {
		style: {
			title: 'Style',
			anyOf: [{
				const: "tabular",
				title: "Tabular"
			}, {
				const: "pointing",
				title: "Pointing"
			}],
			default: 'tabular'
		}
	},
	html: `<element-tabs>
		<div class="ui [style|eq:pointing:secondary pointing:top attached tabular] menu" block-content="items"></div>
		<div block-content="tabs"></div>
	</element-tabs>`,
	stylesheets: [
		'../lib/components/tab.css',
		'../ui/tab.css'
	],
	scripts: [
		'../ui/tab.js'
	],
	resources: [
		'../ui/tab-helper.js'
	],
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources[0], scope);
	}
};


exports.tab_item = {
	title: "Item",
	icon: '<i class="icons"><b class="icon">Tab</b><i class="corner add icon"></i></i>',
	menu: 'widget',
	inplace: true,
	context: 'tabs/tabs_container_items/',
	contents: {
		content: {
			spec: "inline*"
		}
	},
	properties: {
		active: {
			type: 'boolean',
			default: false
		}
	},
	parse: function(dom) {
		var d = {};
		d.active = dom.previousElementSibling == null;
		return d;
	},
	html: '<a class="item [active|?]" block-content="content">Tab Item</a>'
};

exports.tab = {
	title: 'Tab',
	inplace: true,
	context: 'tabs/tabs_container_tabs/',
	contents: {
		content: "block+"
	},
	properties: {
		active: {
			type: 'boolean',
			default: false
		}
	},
	parse: function(dom) {
		var d = {};
		d.active = dom.previousElementSibling == null;
		return d;
	},
	html: '<div class="ui tab [active|?] segment" block-content="content"></div>'
};

