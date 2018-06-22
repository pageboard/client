Pageboard.elements.page.contents.body = {
	spec: 'header? main+ footer?',
	title: 'body'
};

Pageboard.elements.page.stylesheets = [
	'../semantic-ui/reset.css',
	'../ui/site.css',
	'../ui/transition.css'
];
Pageboard.elements.notfound.stylesheets = Pageboard.elements.page.stylesheets.slice();

Pageboard.elements.page.scripts = Pageboard.elements.page.scripts.concat([
	'../ui/transition.js'
]);
Pageboard.elements.notfound.scripts = Pageboard.elements.page.scripts.slice();

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
		}
	}
};

Pageboard.elements.page.apiRender = Pageboard.elements.page.render;

Pageboard.elements.page.render = function(doc, block) {
	var ret = this.apiRender(doc, block);
	var tr = block.data.transition;
	if (tr && tr.from) doc.body.dataset.transitionFrom = tr.from;
	if (tr && tr.to) doc.body.dataset.transitionTo = tr.to;
	if (block.data.redirect) doc.body.dataset.redirect = block.data.redirect;
	return ret;
};

