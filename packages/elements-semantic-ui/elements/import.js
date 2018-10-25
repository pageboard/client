// deprecated, use query element instead
/*
Pageboard.elements.import = {
	priority: 1, // scripts must run after 'form' scripts
	title: "Import",
	icon: '<b class="down arrow icon">?id=</b>',
	menu: "form",
	contents: {
		blocks: {
			title: 'Blocks',
			spec: 'block+',
			virtual: true
		}
	},
	group: "block",
	html: '<div block-content="blocks"></div>',
	required: ["type"],
	properties: {
		type: {
			title: 'Which element',
			type: 'string',
			input: {
				name: 'element',
				properties: true
			}
		},
		name: {
			title: 'What name for query id',
			type: 'string',
			default: 'id'
		}
	},
	mount: function(block, blocks, view) {
		if (!block.content) block.content = {};
		if (!block.content.blocks) {
			// restore might have already filled children
			block.content.blocks = view.doc.createDocumentFragment();
		}
		var id = Page.parse().query[block.data.name];
		if (!id) return;
		var url = Page.format({
			pathname: '/.api/block',
			query: {
				id: id,
				type: block.data.type,
				standalone: true
			}
		});
		return fetch(url).then(function(res) {
			return res.json();
		}).then(function(standalone) {
			standalone = update(blocks, standalone);
			(standalone.children || []).forEach(function(child) {
				update(blocks, child);
			});
			var node = view.render(standalone);
			var existing = block.content.blocks.querySelector(`[block-id="${standalone.id}"]`);
			if (existing) {
				// this is a workaround - block.content.children above should be empty...
				existing.replaceWith(node);
			} else {
				block.content.blocks.appendChild(node);
			}
		}).catch(function(err) {
			console.error(err);
		});
		function update(blocks, block) {
			var stored = blocks[block.id];
			if (stored) return stored;
			blocks[block.id] = block;
			return block;
		}
	}
};
*/
