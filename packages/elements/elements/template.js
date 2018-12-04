Pageboard.elements.template = {
	priority: 1,
	title: 'Template',
	icon: '<b class="icon">[*]</b>',
	menu: 'form',
	group: 'block template',
	contents: {
		template: {
			title: 'Template',
			spec: 'block+'
		}
	},
	html: `<element-template>
		<div block-content="template"></div>
		<div class="view"></div>
	</element-template>`,
	stylesheets: [
		'../ui/template.css'
	],
	scripts: [
		'../ui/template.js'
	]
};

/*
element-template se charge de la fusion et n'est pas connecté à Page.patch

GET : change l'url, requête les données correspondantes à l'url, met à jour la page
 contrainte n°1: recharger la page doit la mettre à jour correctement
 contrainte n°2: le prérendu affiche la même chose
POST: envoie des données, change l'url, met à jour la page
 contrainte n°1: recharger la page ne doit pas resoumettre les données.
  est-ce qu'on doit voir le même résultat quand même ?
 contrainte n°2: le prérendu affiche la même chose
 contrainte n°3: le prérendu du POST peut fonctionner dans ce cas là

Le POST est clairement dans le bon ordre.
Peut-être que le GET n'est pas dans le bon ordre:
GET: requête les données, change l'url, met à jour
mais "fetch" est censé réagir à Page.patch, et en réalité Page.patch(state)
est appelé "pendant" que l'url change, d'où la confusion.

En définitive, si le résultat d'un POST doit être utilisé pour mettre à jour la page,
il faut que le POST "redirige" vers une url, qui est récupérée par un fetch (qui ensuite
fait une requête ou pas).

*/

Pageboard.elements.fetch = Object.assign({}, Pageboard.elements.template, {
	title: "Fetch",
	icon: '<i class="search icon"></i>',
	fuse: function(node, d, scope) {
		// do not call /.api/query if not true
		node.setAttribute('remote', !!(d.method));
		var keys = [];
		(function findKeys(val) {
			if (!val) return;
			if (typeof val == "string") {
				if (val.startsWith('$query.')) keys.push(val.substring(7));
			} else if (Array.isArray(val)) {
				val.forEach(findKeys);
			} else if (typeof val == "object") {
				Object.values(val).forEach(findKeys);
			}
		})(d.parameters);
		if (keys.length) node.setAttribute('keys', keys.join(','));
	},
	properties: {
		method: {
			title: 'Method',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				pattern: "^(\\w+\\.\\w+)?$"
			}]
		},
		parameters: {
			title: 'Parameters',
			anyOf: [{
				type: "object"
			}, {
				type: "null"
			}]
		},
		keys: {
			type: 'array',
			uniqueItems: true,
			items: {
				type: 'string'
			}
		}
	},
	$filter: {
		name: 'service',
		action: "read"
	},
	$helper: 'service'
});

Pageboard.elements.fetch_message = {
	title: 'Message',
	icon: '<i class="announcement icon"></i>',
	menu: "form",
	group: "block",
	context: 'fetch//',
	properties: {
		type: {
			title: "type",
			description: "Message is shown depending on type",
			default: "success",
			anyOf: [{
				const: "success",
				title: "Success"
			}, {
				const: "warning",
				title: "Not found"
			}, {
				const: "error",
				title: "Error"
			}]
		}
	},
	contents: {
		message: {
			title: 'Message',
			spec: "block+"
		}
	},
	html: '<div class="[type]" block-content="message"><p>Message</p></div>'
};


Pageboard.elements.binding = {
	title: "Binding",
	icon: '<b class="icon">[*]</b>',
	properties: {
		fill: {
			title: 'Fill',
			description: 'fill content with matchdom expression, filters on new lines',
			type: 'string'
		},
		attr: {
			title: 'Attribute',
			description: 'set attributes with matchdom expression, filters on new lines',
			type: 'string',
		},
		placeholder: {
			title: 'Placeholder',
			type: 'string',
			format: 'singleline'
		}
	},
	context: 'template//',
	inline: true,
	group: "inline nolink",
	html: '<span data-attr="[attr]" data-fill="[fill]">[ph]</span>',
	fuse: function(node, d, scope) {
		var fill = (d.fill || '').trim().split('\n').join('|');
		node.fuse({
			ph: d.placeholder || fill.split('|', 1)[0].split('.').pop() || '-',
			attr: d.attr ? `[${d.attr.trim().split('\n').join('|')}]`: null,
			fill: fill ? `[${fill}|fill]` : null
		}, scope);
	}
};

Pageboard.elements.content = {
	title: "Content",
	icon: '<b class="icon">cont</b>',
	menu: "form",
	group: 'block',
	context: 'template//',
	properties: {
		name: {
			title: 'Name',
			description: 'Must match element content name',
			type: 'string',
			format: "id",
			$helper: {
				name: 'element-content',
				standalone: true
			}
		}
	},
	html: '<div block-content="[name]"></div>'
};
