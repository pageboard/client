exports.page.contents.body = {
	spec: 'header? main+ footer?',
	title: 'body'
};

exports.page.stylesheets = [
	'../lib/components/reset.css',
	'../ui/site.css',
	'../ui/transition.css'
];

exports.page.scripts = exports.page.scripts.concat([
	'../ui/transition.js'
]);

exports.page.properties.transition = {
	title: 'Transition',
	type: 'object',
	properties: {
		from: {
			title: 'Closing',
			nullable: true,
			anyOf: [{
				type: 'null',
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
			nullable: true,
			anyOf: [{
				type: 'null',
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

exports.page.fuse = function(node, d, scope) {
	node.fuse(d, scope);
	var body = node.querySelector('body');
	var tr = d.transition;
	if (tr && tr.from) body.dataset.transitionFrom = tr.from;
	if (tr && tr.to) body.dataset.transitionTo = tr.to;
	if (d.redirect) body.dataset.redirect = d.redirect;
};

