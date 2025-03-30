exports.input_ocr = {
	title: 'OCR',
	icon: '<i class="eye icon"></i>',
	bundle: true,
	menu: "form",
	group: "block input_field",
	context: 'form//',
	csp: {
		script: ["'wasm-unsafe-eval'"],
		connect: ["data:"],
		worker: ["'self'", "blob:"]
	},
	properties: Object.assign({}, exports.input_text.properties, {
		regexp: {
			title: 'RegExp',
			type: 'string',
			format: 'singleline'
		}
	}),
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<input required="[required]" disabled="[disabled]" is="element-input-ocr"
			value="[value]" name="[name]" regexp="[regexp]" />
	</div>`,
	stylesheets: [
		'../ui/input-ocr.css'
	],
	scripts: [
		'../lib/input-ocr.mjs'
	]
};
