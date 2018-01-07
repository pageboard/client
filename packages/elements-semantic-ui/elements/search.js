Pageboard.elements.search = {
	render: function(doc, block) {
		var rows = block.rows || [];
		return doc.dom`<div class="ui divided link items">
			${rows.map(renderResult)}
		</div>`;
		function renderHeadline(hl) {
			return doc.dom`<p>${hl}</p>`;
		}
		function renderResult(item) {
			return doc.dom`<a href="${item.url}" class="item">
				<div class="content">
					<div class="header">${item.title}</div>
					<div class="description">
						${item.headlines.map(renderHeadline)}
					</div>
					<div class="extra">Last update: ${(new Date(item.updated_at)).toLocaleString()}</div>
				</div>
			</a>`;
		}
	},
	stylesheets: [
		'../semantic-ui/item.css'
	]
};

