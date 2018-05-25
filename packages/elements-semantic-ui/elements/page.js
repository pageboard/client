
Object.assign(Pageboard.elements.page, {
	contents: {
		body: {
			spec: 'header? main+ footer?',
			title: 'body'
		}
	},
	stylesheets: [
		'../semantic-ui/reset.css',
		'../ui/site.css',
		'../ui/transition.css'
	],
	scripts: [
		'/.pageboard/read/custom-elements.min.js',
		'/.pageboard/read/pageboard.js',
		'/.pageboard/read/window-page.js',
		'../ui/transition.js'
	]
});

Pageboard.elements.page.properties.transition = {
	title: 'Transition',
	type: 'object',
	properties: {
		from: {
			title: 'Closing',
			anyOf: [{
				const: '',
				title: 'none'
			}, {
				const: 'up-from',
				title: 'Slide up'
			}, {
				const: 'down-from',
				title: 'Slide down'
			}, {
				const: 'left-from',
				title: 'Slide left'
			}, {
				const: 'right-from',
				title: 'Slide right'
			}, {
				const: 'fade-from',
				title: 'Fade'
			}]
		},
		to: {
			title: 'Opening',
			anyOf: [{
				const: '',
				title: 'none'
			}, {
				const: 'up-to',
				title: 'Slide up'
			}, {
				const: 'down-to',
				title: 'Slide down'
			}, {
				const: 'left-to',
				title: 'Slide left'
			}, {
				const: 'right-to',
				title: 'Slide right'
			}, {
				const: 'fade-to',
				title: 'Fade'
			}]
		},
		redirect: {
			title: 'Redirect',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[a-zA-Z0-9-.]*)+$" // notice the absence of underscore
			}],
			input: {
				name: 'href',
				filter: {
					type: ["link"]
				}
			}
		}
	}
};

Pageboard.elements.page.apiRender = Pageboard.elements.page.render;

Pageboard.elements.page.render = function(doc, block) {
	var ret = this.apiRender(doc, block);
	doc.head.insertAdjacentHTML('afterBegin', `
	<meta name="viewport" content="width=device-width, initial-scale=1">`);
	var tr = block.data.transition;
	if (tr && tr.from) doc.body.dataset.transitionFrom = tr.from;
	if (tr && tr.to) doc.body.dataset.transitionTo = tr.to;
	if (tr && tr.redirect) doc.body.dataset.redirect = tr.redirect;
	return ret;
};

