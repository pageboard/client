exports.fetch.fragments.push({
	attributes: {
		className: "ui"
	}
});

exports.message.fragments.push({
	attributes: {
		className: '[inverted]'
	}
});

exports.message.properties.inverted = {
	title: 'Inverted',
	type: 'boolean',
	default: false
};

exports.message.stylesheets.unshift(
	'../ui/components/message.css'
);
