Pageboard.elements.nav = {
	title: "Nav",
	menu: "Nav",
	description: "Navigation links",
	properties: {
		relation: {
			title: "relation",
			default: "up",
			oneOf: [{
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
	icon: '<i class="icon hand pointer"></i>',
	render: function(doc, block, view) {
		var links = view.block.links || {};
		var rel = block.data.relation;
		var obj = links[rel];
		if (rel == "up") {
			if (obj && obj.length) obj = obj[0];
		}
		var a = doc.dom`<a class="ui icon button">
			<i class="icon ${rel}"></i>
		</a>`;
		if (obj) {
			a.setAttribute('href', obj.url);
			a.setAttribute('title', obj.title);
		} else {
			a.classList.add('disabled');
		}
		return a;
	}
};

Pageboard.elements.breadcrumb = {
	title: "Breadcrumb",
	menu: "Nav",
	group: "block",
	icon: '<b class="icon">&gt;&gt;&gt;</b>',
	render: function(doc, block, view) {
		var page = view.block;
		var list = page.links && page.links.up || [];
		var node = doc.dom`<div class="ui breadcrumb"></div>`;
		list.forEach(function(item, i) {
			if (i > 0) node.insertBefore(doc.dom`<div class="divider"></div>`, node.firstChild);
			node.insertBefore(doc.dom`<a href="${item.url}" class="section">${item.title}</a>`, node.firstChild);
		});
		node.appendChild(doc.dom`<div class="divider"></div>`);
		node.appendChild(doc.dom`<div class="active section">${page.data.title}</div>`);
		return node;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/breadcrumb.css'
	]
};

