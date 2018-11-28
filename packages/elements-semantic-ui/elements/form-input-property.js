Pageboard.elements.input_property = {
	title: 'Property',
	menu: 'form',
	group: 'block',
	context: 'form//',
	icon: '<i class="icon">X</i>',
	properties: {
		name: {
			title: 'name',
			type: 'string',
			format: 'singleline',
			$helper: 'element-property'
		},
		disabled: {
			title: 'disabled',
			type: 'boolean',
			default: false
		},
		radios: {
			title: 'Show radios if less than',
			description: 'If number of options is over this number, show a <select>',
			type: 'integer',
			default: 5
		},
		range: {
			title: 'Show range if interval less than',
			type: 'integer',
			default: 10
		},
		multiple: {
			title: 'Allow multiple choices',
			type: 'boolean',
			default: false
		},
		foldable: {
			title: 'Foldable',
			type: 'boolean',
			default: false
		},
		template: {
			title: 'Template',
			description: 'Query value template',
			type: 'string',
			context: 'query'
		}
	},
	render: function(block, scope) {
		var doc = scope.$doc;
		var d = block.data;
		var name = d.name;
		var node = scope.$doc.dom('<div><code>select property name</code></div>');
		if (!name) {
			return node;
		}
		var list = name.split('.');
		var el = scope.$elements[list[0]];
		if (!el) {
			return node;
		}
		// list[0] = "data";
		// /.api/form wraps it into block.data
		list.shift();
		name = list.join('.');
		var prop = el;
		var propKey;
		var required = false;
		for (var i=0; i < list.length; i++) {
			propKey = list[i];
			required = prop.required && prop.required.indexOf(propKey) >= 0;
			prop = prop.properties && prop.properties[propKey] || null;
			if (prop == null) break;
		}
		if (!prop) {
			return node;
		}
		node.textContent = "";
		var listOf = prop.anyOf || prop.oneOf;
		var propType;
		if (listOf) {
			var listOfNo = listOf.filter(function(item) {
				return item.type != "null";
			});
			if (listOfNo.length != listOf.length) {
				required = false;
			}
			if (listOfNo.length == 1 && listOfNo[0].const === undefined) {
				propType = listOfNo[0];
				listOf = null;
			} else if (d.multiple) {
				listOf = listOfNo;
			}
		} else if (Array.isArray(prop.type)) {
			listOf = prop.type.filter(function(type) {
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
		if (!propType) propType = prop;

		if (listOf) {
			if (listOf.length <= d.radios) {
				var content = '<div class="content"></div>';
				if (d.foldable) {
					node.appendChild(doc.dom(`<element-accordion class="grouped fields">
						<label for="${name}" class="title active caret-icon">${prop.title}</label>
						${content}
					</element-accordion>`));
				} else {
					node.appendChild(doc.dom(`<div class="grouped fields">
						<label for="${name}" class="title">${prop.title}</label>
						${content}
					</div>`));
				}
				listOf.forEach(function(item) {
					content.appendChild(scope.$render({
						type: d.multiple ? 'input_checkbox' : 'input_radio',
						data: {
							name: name,
							value: item.type == "null" ? null : item.const,
							disabled: d.disabled
						},
						content: {
							label: item.title
						}
					}));
				});
			} else {
				var frag = doc.createDocumentFragment();
				listOf.forEach(function(item) {
					var option = scope.$render({
						type: 'input_select_option',
						data: {
							value: item.type == "null" ? null : item.const
						},
						content: {
							label: item.title
						}
					});
					frag.appendChild(option);
				});
				var select = scope.$render({
					type: 'input_select',
					data: {
						name: name,
						multiple: d.multiple,
						placeholder: prop.description,
						disabled: d.disabled,
						required: required,
						template: d.template
					},
					content: {
						label: prop.title,
						options: frag
					}
				});
				node.appendChild(select);
			}
		} else if (propType.type == "integer") {
			if (propType.minimum != null && propType.maximum != null) {
				if (propType.maximum - propType.minimum <= d.range) {
					return node.appendChild(scope.$render({
						type: 'input_range',
						data: {
							name: name,
							min: propType.minimum,
							max: propType.maximum,
							value: propType.default,
							disabled: d.disabled,
							required: required,
							template: d.template,
							step: 1
						},
						content: {
							label: prop.title
						}
					}));
				}
			}
			node.appendChild(scope.$render({
				type: 'input_text',
				data: {
					name: name,
					type: 'number',
					default: propType.default,
					disabled: d.disabled,
					required: required,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "boolean") {
			node.appendChild(scope.$render({
				type: 'input_checkbox',
				data: {
					name: name,
					value: "true",
					disabled: d.disabled,
					required: required,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "string" && propType.format == "date") {
			node.appendChild(scope.$render({
				type: 'input_date_time',
				data: {
					name: name,
					type: propType.format,
					default: propType.default,
					disabled: d.disabled,
					required: required,
					step: propType.step,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else if (propType.type == "string" && propType.format == "time") {
			node.appendChild(scope.$render({
				type: 'input_date_time',
				data: {
					name: name,
					type: propType.format,
					default: propType.default,
					disabled: d.disabled,
					required: required,
					step: propType.step,
					template: d.template
				},
				content: {
					label: prop.title
				}
			}));
		} else {
			var input = scope.$render({
				type: 'input_text',
				data: {
					name: name,
					type: propType.format == 'singleline' ? 'text' : 'textarea',
					disabled: d.disabled,
					default: propType.default,
					required: required,
					template: d.template
				},
				content: {
					label: prop.title
				}
			});
			node.appendChild(input);
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

