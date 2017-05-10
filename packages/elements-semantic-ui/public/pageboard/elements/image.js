(function(exports) {

var imageIcon = '<svg width="20" height="20" viewBox="0 -150 1071 850" xmlns="http://www.w3.org/2000/svg"><path d="M357 529q0-45-31-76t-76-32-76 32-31 76 31 76 76 31 76-31 31-76zm572-215V64H143v107l178 179 90-89 285 285zm53 393H89q-7 0-12-5t-6-13V11q0-7 6-13t12-5h893q7 0 13 5t5 13v678q0 8-5 13t-13 5zm89-18V11q0-37-26-63t-63-27H89q-36 0-63 27T0 11v678q0 37 26 63t63 27h893q37 0 63-27t26-63z" fill="#666"/></svg>';

exports.image = Object.assign(exports.image || {}, {
	title: "Image",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri"
		}
	},
	contents: {
		legend: {
			spec: "block+",
			title: 'content'
		}
	},
	group: "block",
	icon: imageIcon,
	view: function(doc, block) {
		var url = block.data.url || '/public/pageboard/ui/placeholder.png';
		var prefix = '/public/uploads/';
		if (url.startsWith(prefix)) url = '/public/images/' + url.substring(prefix.length);
		return doc.dom`<div class="ui basic segment"><div class="ui fluid image">
			<img src="${url}"
				srcset="${url}?rs=w:160 160w,
				${url}?rs=w:320 320w,
				${url}?rs=w:640 640w,
				${url}?rs=w:1280 1280w" />
			<div class="ui black bottom attached label" block-content="legend"></div>
		</div></div>`;
	},
	stylesheets: [
		'/public/semantic-ui/components/segment.css',
		'/public/semantic-ui/components/image.css',
		'/public/semantic-ui/components/label.css'
	]
});

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

