exports.core = {
	bundle: true,
	dependencies: ['elements'],
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

exports.content = {
	title: 'Content',
	properties: {
		name: {
			title: 'Name',
			type: 'string',
			format: 'name'
		},
		lang: {
			title: 'Language',
			type: 'string',
			format: 'lang'
		},
		text: {
			title: 'Text',
			type: 'string'
		},
		valid: {
			title: 'Valid',
			type: 'boolean',
			default: false
		}
	}
};
