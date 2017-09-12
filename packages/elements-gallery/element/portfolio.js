Pageboard.elements.portfolio = {
	title: "Portfolio",
	properties: {},
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
			format: "uri",
			input: {
				name: 'href',
				media: ["image", "svg"]
			}
		}
	},
	contents: {
		cell: {
			spec: "layout",
			title: "cell"
		}
	},
	icon: '<b class="icon">Cell</b>',
	render: function(doc, block) {
		var url = block.data.url;
		var img = "";
		if (url) {
			var sep = '?';
			if (url.startsWith('/') == false) {
				url = ".api/image?url=" + encodeURIComponent(url);
				sep = '&';
			}

			var ratio = block.data.ratio.split(':');
			var vals = {"1": 97, "2": 197};
			// see portfolio.css for how to compute those numbers
			var w = vals[ratio[0]];
			var h = vals[ratio[1]];
			var large = ratio[0] == 2;

			img = doc.dom`<img src="${url}"
				srcset="${url}${sep}rs=w:${w}%2Ch:${h}%2Cenlarge 160w,
				${url}${sep}rs=w:${2*w}%2Ch:${2*h}%2Cenlarge 320w,
				${url}${sep}rs=w:${4*w}%2Ch:${4*h}%2Cenlarge 640w,
				${url}${sep}rs=w:${8*w}%2Ch:${8*h}%2Cenlarge 1280w" />`;
		}
		return doc.dom`<div class="portfolio item ${large ? 'large' : ''}">
			<div class="portfolio image">${img}</div>
			<div class="portfolio cell" block-content="cell"></div>
		</div>`;
	}
};

