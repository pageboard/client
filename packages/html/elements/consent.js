exports.consent_form = {
	priority: 11,
	title: 'Consent',
	icon: '<i class="handshake icon"></i>',
	group: "block",
	menu: 'form',
	properties: {
		transient: {
			title: 'Transient',
			description: 'Hide if not needed',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		id: "content",
		nodes: "block+"
	},
	upgrade: {
		'content.': 'content.content'
	},
	html: `<form is="element-consent" class="ui form" data-transient="[transient]">
		<x[transient|alt:template:div|at:-] block-content="content"></x[transient|alt:template:div|at:-]>
	</form>`,
	scripts: ['../ui/storage.js', '../ui/consent.js'],
	stylesheets: ['../ui/consent.css']
};

exports.input_radio_yes = {
	title: 'Yes',
	icon: '<i class="thumbs up icon"></i>',
	menu: "form",
	group: "block",
	context: 'consent_form//',
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<div class="ui radio checkbox">
			<input type="radio" name="consent" value="yes" id="for-consent-yes" />
			<label block-content="label" for="for-consent-yes">Yes</label>
		</div>
	</div>`
};

exports.input_radio_no = {
	title: 'No',
	icon: '<i class="thumbs down icon"></i>',
	menu: "form",
	group: "block",
	context: 'consent_form//',
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<div class="ui radio checkbox">
			<input type="radio" name="consent" value="no" id="for-consent-no" />
			<label block-content="label" for="for-consent-no">No</label>
		</div>
	</div>`
};
