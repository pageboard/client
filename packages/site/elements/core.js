exports.core = {
	bundle: true,
	scripts: ["../lib/pageboard.js"],
	priority: -1000 // way before page group
};


exports.otp = {
	bundle: 'user',
	group: 'block',
	virtual: true,
	properties: {
		uri: {
			type: 'string'
		}
	},
	tag: 'img.otpkey',
	html: `<img class="otpkey" src="[uri]" width="196" height="196" />`
};

