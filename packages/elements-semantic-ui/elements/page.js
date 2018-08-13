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

Pageboard.elements.page.fuse = function(node, d, scope) {
	node.fuse(d, scope);
	var body = node.ownerDocument.body;
	var tr = d.transition;
	if (tr && tr.from) body.dataset.transitionFrom = tr.from;
	if (tr && tr.to) body.dataset.transitionTo = tr.to;
	if (d.redirect) body.dataset.redirect = d.redirect;
};

