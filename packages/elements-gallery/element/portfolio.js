Pageboard.elements.portfolio = {
	title: "Portfolio",
	contents: {
		items: {
			spec: "portfolio_item+",
			title: 'items'
		}
	},
	group: 'block',
	icon: '<b class="icon">Por</b>',
	render: function(doc, block, view) {
		return doc.dom`<element-portfolio block-content="items"></element-portfolio>`;
	},
	stylesheets: [
		'../ui/portfolio.css'
	],
	scripts: [
		'../ui/imagesloaded.js',
		'../ui/isotope.js',
		'../ui/portfolio.js'
	]
};

Pageboard.elements.portfolio_item = {
	title: "Item",
	properties: {
		ratio: {
			title: 'Size',
			description: 'Cell size',
			oneOf: [{
				constant: "1:1",
				title: "1:1"
			}, {
				constant: "1:2",
				title: "1:2"
			}, {
				constant: "2:1",
				title: "2:1"
			}, {
				constant: "2:2",
				title: "2:2"
			}],
			default: "1:1"
		},
		url: {
			title: 'Image',
			description: 'Local or remote URL',
			type: "string",
			format: "uri"
		}
	},
	contents: {
		cell: {
			spec: "paragraph*",
			title: "cell"
		}
	},
	icon: '<b class="icon">Cell</b>',
	render: function(doc, block) {
		var ratio = block.data.ratio.split(':');
		var url = block.data.url;
		var img = "";
		if (url) {
			var sep = '?';
			if (url.startsWith('/') == false) {
				url = ".api/image?url=" + encodeURIComponent(url);
				sep = '&';
			}
			var w = 100 * ratio[0];
			var h = 100 * ratio[1];
			img = doc.dom`<img src="${url}"
				srcset="${url}${sep}rs=w:${w}%2Ch=${h} 160w,
				${url}${sep}rs=w:${w}%2Ch=${h} 320w,
				${url}${sep}rs=w:${2*w}%2Ch=${2*h} 640w,
				${url}${sep}rs=w:${3*w}%2Ch=${3*h} 1280w" />`;
			console.log("generates img", img);
		} else {
			console.log("no img", block);
		}
		var large = ratio[0] == 2 ? 'large' : '';
		return doc.dom`<div class="item ${large}">
			<div class="image">${img}</div>
			<div block-content="cell"></div>
		</div>`;
	}
};

