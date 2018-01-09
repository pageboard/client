
Pageboard.elements.page = Object.assign(Pageboard.elements.page, {
	contents: {
		body: {
			spec: 'header? main+ footer?',
			title: 'body'
		}
	},
	stylesheets: [
		'../semantic-ui/reset.css',
		'../ui/site.css'
	],
	scripts: [
		'../ui/lib/custom-elements.min.js',
		'/.pageboard/read/window-page.js',
		'/.pageboard/read/dom-template-strings.js'
	]
});

