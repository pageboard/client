
Pageboard.elements.page = Object.assign(Pageboard.elements.page, {
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
	anyOf: [{
		const: '',
		title: 'none'
	}, {
		const: 'up',
		title: 'Slide up'
	}, {
		const: 'down',
		title: 'Slide down'
	}, {
		const: 'left',
		title: 'Slide left'
	}, {
		const: 'right',
		title: 'Slide right'
	}, {
		const: 'fadeout',
		title: 'Fade out'
	}]
};

Pageboard.elements.page.apiRender = Pageboard.elements.page.render;

Pageboard.elements.page.render = function(doc, block) {
	var ret = this.apiRender(doc, block);
	doc.head.insertAdjacentHTML('afterBegin', `
	<meta name="viewport" content="width=device-width, initial-scale=1">`);
	if (block.data.transition) {
		doc.body.dataset.transition = block.data.transition;
	}
	return ret;
};

