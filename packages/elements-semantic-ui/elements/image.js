Pageboard.elements.image = {
	title: "Image",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				media: ["image", "svg"]
			}
		}
	},
	group: "block",
	icon: '<i class="icon image"></i>',
	render: function(doc, block) {
		var url = block.data.url || '/.pageboard/ui/placeholder.png';
		var sep = '?';
		if (url.startsWith('/') == false) {
			url = ".api/image?url=" + encodeURIComponent(url);
			sep = '&';
		}

		return doc.dom`<img src="${url}"
				srcset="${url}${sep}rs=w:160 160w,
				${url}${sep}rs=w:320 320w,
				${url}${sep}rs=w:640 640w,
				${url}${sep}rs=w:1280 1280w" />`;
	}
};

