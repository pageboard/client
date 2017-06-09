(function(exports) {

exports.image = {
	title: "Image",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri"
		}
	},
	contents: {},
	group: "block",
	icon: '<i class="icon image"></i>',
	view: function(doc, block) {
		var url = block.data.url || '/public/pageboard/ui/placeholder.png';
		var prefix = '/public/uploads/';
		if (url.startsWith(prefix)) url = '/public/images/' + url.substring(prefix.length);
		return doc.dom`<img src="${url}"
				srcset="${url}?rs=w:160 160w,
				${url}?rs=w:320 320w,
				${url}?rs=w:640 640w,
				${url}?rs=w:1280 1280w" />`;
	}
};

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

