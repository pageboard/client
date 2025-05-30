exports.site.properties.extra.properties.cookiebot = {
	title: 'Cookie Bot ID',
	nullable: true,
	type: 'string',
	pattern: /^[a-z0-9-]+$/.source
};

exports.cookiebot = {
	title: 'Cookie Bot',
	icon: '<i class="info circle icon"></i>',
	menu: "link",
	group: "block",
	priority: 10,
	csp: {
		script: [
			"https://*.cookiebot.com"
		],
		connect: [
			"https://*.cookiebot.com"
		],
		frame: [
			"https://*.cookiebot.com"
		]
	},
	html: `<div data-src="https://consent.cookiebot.com/[$parent.data.extra?.cookiebot|fail:*]/cd.js" is="element-cookiebot-declaration">Cookie Bot Declaration</div>`,
	scripts: [
		'../ui/cookiebot.js'
	],
	stylesheets: [
		'../ui/cookiebot.css'
	]
};

exports.page.fragments.push({
	path: 'head',
	position: 'beforeend',
	html: `<script src="https://consent.cookiebot.com/uc.js?cbid=[$parent.data.extra?.cookiebot|fail:*|enc:url]" async data-culture="[$lang]"></script>`
});
