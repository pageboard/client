exports.page.stylesheets = [
	'../lib/components/reset.css',
	'../ui/site.css',
	'../ui/page.css',
	'../ui/transition.css'
];

exports.page.scripts = exports.page.scripts.concat([
	'../ui/transition.js'
]);

exports.page.properties.transition = {
	title: 'Transition',
	type: 'object',
	properties: {
		close: {
			title: 'Close',
			nullable: true,
			anyOf: [{
				type: 'null',
				title: 'None'
			}, {
				const: 'tr-up',
				title: 'To up'
			}, {
				const: 'tr-down',
				title: 'To down'
			}, {
				const: 'tr-left',
				title: 'To left'
			}, {
				const: 'tr-right',
				title: 'To right'
			}, {
				const: 'fade',
				title: 'Fade out'
			}]
		},
		open: {
			title: 'Open',
			nullable: true,
			anyOf: [{
				type: 'null',
				title: 'None'
			}, {
				const: 'tr-up',
				title: 'From up'
			}, {
				const: 'tr-down',
				title: 'From down'
			}, {
				const: 'tr-left',
				title: 'From left'
			}, {
				const: 'tr-right',
				title: 'From right'
			}, {
				const: 'fade',
				title: 'Fade in'
			}]
		}
	}
};

exports.page.fuse = function(node, d, scope) {
	node.fuse(d, scope);
	var body = node.querySelector('body');
	var tr = d.transition;
	if (tr && tr.close) body.dataset.transitionClose = tr.close;
	if (tr && tr.open) body.dataset.transitionOpen = tr.open;
	if (d.redirect) body.dataset.redirect = d.redirect;
};

