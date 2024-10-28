exports.page.properties.beacons = {
	title: 'Beacons',
	additionalProperties: {
		type: 'string',
		format: 'singleline'
	}
};

exports.page.fragments.push({
	path: 'head',
	position: 'beforeend',
	html: `<meta name="beacons" is="element-beacons" content="[beacons|fail:*|as:query]">`
});
exports.page.scripts.push("../ui/beacons.js");
