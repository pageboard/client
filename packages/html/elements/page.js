exports.page.stylesheets = [
	'../lib/components/reset.css',
	'../ui/site.css',
	'../ui/page.css',
	'../ui/transition.css'
];

exports.page.scripts = [
	...exports.page.scripts,
	'../ui/transition.js'
];

exports.page.properties.transition = {
	title: 'Transition',
	type: 'object',
	nullable: true,
	properties: {
		close: {
			title: 'Close',
			anyOf: [{
				const: null,
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
			anyOf: [{
				const: null,
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

exports.page.fragments.push({
	path: 'body',
	attributes: {
		"data-transition-close": "[transition.close?]",
		"data-transition-open": "[transition.open?]",
	}
});
