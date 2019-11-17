exports.consent_form = {
	priority: 11,
	title: 'Consent',
	icon: '<b class="icon">DNT</b>',
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
	contents: "block+",
	html: '<form is="element-consent" class="ui form" data-transient="[transient]"></form>',
	scripts: ['../ui/consent.js'],
	stylesheets: ['../ui/consent.css']
};

exports.input_radio_yes = {
	title: 'Yes',
	icon: '<i class="selected radio icon"></i>',
	menu: "form",
	group: "block",
	context: 'consent_form//',
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<div class="ui radio checkbox">
			<input type="radio" name="dnt" value="no" id="[$id|slice:0:4|pre:for]" />
			<label block-content="label" for="[$id|slice:0:4|pre:for]">Yes</label>
		</div>
	</div>`
};

exports.input_radio_no = {
	title: 'No',
	icon: '<i class="selected radio icon"></i>',
	menu: "form",
	group: "block",
	context: 'consent_form//',
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<div class="ui radio checkbox">
			<input type="radio" name="dnt" value="yes" id="[$id|slice:0:4|pre:for]" />
			<label block-content="label" for="[$id|slice:0:4|pre:for]">No</label>
		</div>
	</div>`
};
