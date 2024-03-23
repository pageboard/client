exports.input_ocr = {
	title: 'OCR',
	icon: '<i class="eye icon"></i>',
	menu: "form",
	group: "block input_field",
	context: 'form//',
	properties: Object.assign({}, exports.input_text.properties, {

	}),
	contents: {
		id: 'label',
		nodes: 'inline*'
	},
	html: `<div class="field">
		<label block-content="label">Label</label>
		<input required="[required]" disabled="[disabled]" is="element-input-ocr"
			value="[value]"
			name="[name]" />
	</div>`,
	stylesheets: [
		'../ui/input-ocr.css'
	],
	scripts: [
		'../lib/tesseract-worker.js',
		'../ui/input-ocr.js'
	],
	resources: {
		fallback: '../lib/tesseract-core-fallback.wasm',
		core: '../lib/tesseract-core.wasm',
	}
};
