exports.input_property = {
	// deprecated
	menu: 'form',
	group: 'block',
	context: 'form//',
	properties: {
		name: {
			title: 'Name',
			type: 'string',
			format: 'singleline',
			$helper: 'element-property'
		},
		radios: {
			title: 'Radios < Select',
			type: 'integer',
			default: 5
		},
		range: {
			title: 'Range < Input',
			type: 'integer',
			default: 10
		},
		disabled: {
			title: 'Disabled',
			type: 'boolean',
			default: false
		},
		multiple: {
			title: 'Multiple choices',
			type: 'boolean',
			default: false
		},
		foldable: {
			title: 'Foldable',
			type: 'boolean',
			default: false
		}
	},
	html: '<div><code>select property name</code></div>',
	fuse: function(node, d, scope) {
		const view = scope.$view;
		const doc = scope.$doc;
		const dateFormats = ["date", "time", "date-time"];
		let name = d.name;
		if (!name) {
			return node;
		}
		const list = name.split('.');
		const el = scope.$elements[list[0]];
		if (!el) {
			return node;
		}
		// list[0] = "data";
		// /.api/form wraps it into block.data
		list.shift();
		name = list.join('.');
		const id = scope.$id;
		let prop = el;
		let propKey;
		let required = false;
		let cases = null;
		let discKey = null;
		for (let i = 0; i < list.length; i++) {
			propKey = list[i];
			required = prop.required && prop.required.indexOf(propKey) >= 0;
			if (cases) {
				if (Array.isArray(cases)) {
					prop = cases.find(obj => {
						if (obj.properties && obj.properties[discKey] && obj.properties[discKey].const == propKey) {
							return true;
						} else {
							return false;
						}
					});
				} else {
					prop = cases[propKey];
				}
				name = list.slice(0, i - 1).concat(list.slice(i + 1)).join('.');
				cases = null;
				discKey = null;
			} else {
				if (prop.type == "array" && prop.items && !Array.isArray(prop.items)) {
					prop = prop.items;
				}
				if (prop.select && prop.select.$data == `0/${propKey}`) {
					cases = prop.selectCases;
				} else if (prop.discriminator && prop.discriminator.propertyName == propKey) {
					cases = prop.oneOf;
					discKey = propKey;
				}
				if (prop.properties) prop = prop.properties;
				prop = prop[propKey];
			}
			if (prop == null) break;
		}
		if (!prop) {
			return node;
		}
		node.textContent = "";
		if (prop.nullable) required = false;
		let propType = prop;
		let multiple = d.multiple;
		if (prop.type == "array" && prop.items && Array.isArray(prop.items) == false) {
			propType = prop.items;
			multiple = true;
		}

		let listOf = propType.anyOf || propType.oneOf;
		if (listOf) {
			const listOfNo = listOf.filter(item => item.type != "null");
			if (listOfNo.length != listOf.length) {
				required = false;
			}
			if (listOfNo.length == 1 && listOfNo[0].const === undefined) {
				propType = listOfNo[0];
				listOf = null;
			} else if (multiple) {
				listOf = listOfNo;
			}
		} else if (Array.isArray(prop.type)) {
			listOf = prop.type.filter(type => {
				if (type == "null") {
					required = false;
					return false;
				} else {
					return true;
				}
			});
			if (listOf.length == 1) {
				propType = listOf[0];
				listOf = null;
			} else {
				listOf = null; // cannot deal with this for now
			}
		}

		if (listOf) {
			if (listOf.length <= d.radios) {
				let content;
				if (d.foldable) {
					content = doc.dom(`<element-accordion class="grouped fields">
						<label for="${name}" class="title active caret-icon">${prop.title}</label>
						<div class="content"></div>
					</element-accordion>`);
				} else {
					content = doc.dom(`<div class="grouped fields">
						<label for="${name}" class="title">${prop.title}</label>
						<div class="content"></div>
					</div>`);
				}
				node.appendChild(content);
				content = content.lastElementChild;
				for (const item of listOf) {
					content.appendChild(view.render({
						type: multiple ? 'input_checkbox' : 'input_radio',
						id,
						data: {
							name: name,
							value: item.type == "null" ? null : item.const,
							disabled: d.disabled
						},
						content: {
							label: item.title
						}
					}));
				}
			} else {
				const frag = doc.createDocumentFragment();
				for (const item of listOf) {
					frag.appendChild(view.render({
						type: 'input_select_option',
						data: {
							value: item.type == "null" ? null : item.const
						},
						content: {
							label: item.title
						}
					}));
				}
				node.appendChild(view.render({
					id,
					type: 'input_select',
					data: {
						name: name,
						multiple: multiple,
						disabled: d.disabled,
						required: required
					},
					content: {
						label: prop.title,
						options: frag
					}
				}));
			}
		} else if (propType.type == "integer" || propType.type == "number") {
			const step = propType.multipleOf || (propType.type == "integer" ? 1 : 0.001);
			if (propType.minimum != null && propType.maximum != null) {
				if (propType.maximum - propType.minimum <= d.range) {
					return node.appendChild(view.render({
						id,
						type: 'input_range',
						data: {
							name: name,
							min: propType.minimum,
							max: propType.maximum,
							value: multiple ? `${propType.minimum}⩽${propType.maximum}` : propType.default,
							disabled: d.disabled,
							required: required,
							multiple: multiple,
							step: step
						},
						content: {
							label: prop.title
						}
					}));
				}
			}
			node.appendChild(view.render({
				id,
				type: 'input_number',
				data: {
					name: name,
					default: propType.default,
					disabled: d.disabled,
					required: required,
					min: propType.minimum,
					max: propType.maximum,
					step: step
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "boolean") {
			node.appendChild(view.render({
				id,
				type: 'input_checkbox',
				data: {
					name: name,
					value: "true",
					disabled: d.disabled,
					required: required
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "object" && Object.keys(propType.properties).sort().join(' ') == "end start" && dateFormats.includes(propType.properties.start.format) && dateFormats.includes(propType.properties.end.format)) {
			node.appendChild(view.render({
				id,
				type: 'input_date_slot',
				data: {
					nameStart: name,
					nameEnd: name,
					format: propType.properties.start.format.replace('-', ''),
					disabled: d.disabled,
					required: required,
					step: propType.properties.start.step
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "string" && dateFormats.includes(propType.format)) {
			if (d.multiple) node.appendChild(view.render({
				id,
				type: 'input_date_slot',
				data: {
					nameStart: name,
					nameEnd: name,
					format: propType.format.replace('-', ''),
					default: propType.default,
					disabled: d.disabled,
					required: required,
					step: propType.step
				},
				content: {
					label: prop.title
				}
			}));
			else node.appendChild(view.render({
				id,
				type: 'input_date_time',
				data: {
					name: name,
					format: propType.format.replace('-', ''),
					default: propType.default,
					disabled: d.disabled,
					required: required,
					step: propType.step
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.$helper && propType.$helper.name == "href") {
			const limits = {
				files: multiple ? null : 1
			};
			const filter = propType.$helper.filter;
			if (filter && filter.type) {
				limits.types = filter.type.map(type => {
					if (type == "image") return "image/*";
					else if (type == "video") return "video/*";
					else return "*/*";
				});
			}
			node.appendChild(view.render({
				id,
				type: 'input_file',
				data: {
					name: name,
					disabled: d.disabled,
					required: required,
					limits: limits
				},
				content: {
					label: prop.title
				}
			}));
		} else {
			const type = (propType.format || propType.pattern) ? 'text' : 'textarea';
			node.appendChild(view.render({
				id,
				type: 'input_text',
				data: {
					name, type, required,
					disabled: d.disabled,
					default: propType.default
				},
				content: {
					label: prop.title
				}
			}));
		}
		return node;
	},
	stylesheets: [
		'../lib/components/accordion.css',
		'../ui/accordion.css'
	],
	scripts: [
		'../ui/accordion.js'
	]
};

