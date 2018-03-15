Pageboard.elements.tabs = {
	title: "Tabs",
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
	icon: '<b class="icon">Tabs</b>',
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
	render: function(doc, block) {
		var d = block.data;
		var style;
		switch (d.style) {
			case "pointing":
				style = "secondary pointing";
			break;
			default:
				style = "top attached tabular";
			break;
		}
		return doc.dom`<element-tabs>
			<div class="ui ${style} menu" block-content="items"></div>
			<div block-content="tabs"></div>
		</element-tabs>`;
	},
	stylesheets: [
		'../semantic-ui/tab.css'
	],
	scripts: [
		'../ui/tab.js'
	],
	resources: [
		'../ui/tab-helper.js'
	],
	install: function(doc, page, view) {
		if (Pageboard.write) this.scripts = this.resources;
	}
};


Pageboard.elements.tab_item = {
	title: "Item",
	menu: 'widget',
	inplace: true,
	context: 'tabs/tabs_container_items/',
	contents: {
		content: {
			spec: "text*"
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
		if (dom.matches('.active')) d.active = true;
		return d;
	},
	icon: '<b class="icon">Tab</b>',
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<a class="item ${d.active ? 'active' : ''}" block-content="content">tab</a>`;
	}
};

Pageboard.elements.tab = {
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
		if (dom.matches('.active')) d.active = true;
		return d;
	},
	render: function(doc, block) {
		var d = block.data;
		return doc.dom`<div class="ui tab ${d.active ? 'active' : ''} segment" block-content="content">tab</div>`;
	}
};

