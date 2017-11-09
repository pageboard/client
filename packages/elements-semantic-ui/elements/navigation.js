Pageboard.elements.nav = {
	title: "Nav",
	menu: "Nav",
	description: "Navigation links",
	properties: {
		relation: {
			title: "relation",
			default: "up",
			oneOf: [{
				constant: "up",
				title: "up"
			}, {
				constant: "prev",
				title: "previous"
			}, {
				constant: "next",
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

