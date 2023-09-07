exports.svg = {
	title: "Svg",
	bundle: true,
	icon: '<i class="object ungroup icon"></i>',
	menu: 'media',
	group: "block",
	properties: {
		viewBox: {
			title: 'View Box',
			type: 'string',
			description: 'Typically "0 0 width height"'
		},
		width: {
			title: 'Width',
			type: 'integer'
		},
		height: {
			title: 'Height',
			type: 'integer'
		}
	},
	contents: "svg_defs? svg_node+",
	ns: "svg",
	html: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="[viewBox]" width="[width]" height="[height]"></svg>`
};

exports.text.group += ' svg_inline';

exports.svg_text = {
	title: "text",
	icon: '<i class="icon font"></i>',
	menu: 'media',
	group: "svg_node",
	properties: {
		x: {
			title: 'x',
			type: 'number',
			nullable: true
		},
		y: {
			title: 'y',
			type: 'number',
			nullable: true
		}
	},
	contents: "svg_inline*",
	inplace: true,
	ns: "svg",
	html: `<text x="[x]" y="[y]">Text</text>`
};

exports.svg_tspan = {
	title: "span",
	icon: '<i class="icon font"></i>',
	menu: 'media',
	group: "svg_inline",
	properties: {
	},
	contents: "text*",
	inplace: true,
	inline: true,
	ns: "svg",
	html: `<tspan></tspan>`
};

exports.svg_defs = {
	title: "defs",
	icon: '<b class="icon">defs</b>',
	menu: 'media',
	contents: "svg_node+",
	inplace: true,
	ns: "svg",
	html: `<defs></defs>`
};

exports.svg_group = {
	title: "group",
	icon: '<i class="clone outline icon"></i>',
	menu: 'media',
	group: "svg_node",
	properties: {
		id: {
			title: 'id',
			type: 'string',
			format: 'id',
			nullable: true
		},
		fill: {
			title: 'Fill',
			type: 'string',
			nullable: true
		},
		stroke: {
			title: 'Stroke',
			type: 'string',
			nullable: true
		},
		transform: {
			title: 'Transform',
			type: 'string',
			nullable: true
		}
	},
	contents: "svg_node+",
	inplace: true,
	ns: "svg",
	html: `<g id="[id]" fill="[fill]" stroke="[stroke]" transform="[transform]"></g>`
};

exports.svg_path = {
	title: "path",
	icon: '<b class="icon">path</b>',
	menu: 'media',
	group: "svg_node",
	properties: {
		d: {
			title: 'd',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<path d="[d]"></path>`
};

exports.svg_line = {
	title: "line",
	icon: '<b class="icon">line</b>',
	menu: 'media',
	group: "svg_node",
	properties: {
		x1: {
			title: 'x1',
			type: 'number',
			nullable: true
		},
		y1: {
			title: 'y1',
			type: 'number',
			nullable: true
		},
		x2: {
			title: 'x2',
			type: 'number',
			nullable: true
		},
		y2: {
			title: 'y2',
			type: 'number',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<line x1="[x1]" y1="[y1]" x2="[x2]" y2="[y2]"></line>`
};

exports.svg_rect = {
	title: "rect",
	icon: '<i class="square outline icon"></i>',
	menu: 'media',
	group: "svg_node",
	properties: {
		x: {
			title: 'x',
			type: 'number',
			nullable: true
		},
		y: {
			title: 'y',
			type: 'number',
			nullable: true
		},
		width: {
			title: 'Width',
			type: 'number',
			nullable: true
		},
		height: {
			title: 'Height',
			type: 'number',
			nullable: true
		},
		rx: {
			title: 'rx',
			type: 'number',
			nullable: true
		},
		ry: {
			title: 'ry',
			type: 'number',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<rect x="[x]" y="[y]" width="[width]" height="[height]" rx="[rx]" ry="[ry]"></rect>`
};

exports.svg_circle = {
	title: "circle",
	icon: '<i class="circle outline icon"></i>',
	menu: 'media',
	group: "svg_node",
	properties: {
		cx: {
			title: 'cx',
			type: 'number',
			nullable: true
		},
		cy: {
			title: 'cy',
			type: 'number',
			nullable: true
		},
		r: {
			title: 'r',
			type: 'number',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<circle cx="[cx]" cy="[cy]" r="[r]"></circle>`
};

exports.svg_ellipse = {
	title: "ellipse",
	icon: '<i class="circle outline icon"></i>',
	menu: 'media',
	group: "svg_node",
	properties: {
		cx: {
			title: 'cx',
			type: 'number',
			nullable: true
		},
		cy: {
			title: 'cy',
			type: 'number',
			nullable: true
		},
		rx: {
			title: 'rx',
			type: 'number',
			nullable: true
		},
		ry: {
			title: 'ry',
			type: 'number',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<ellipse cx="[cx]" cy="[cy]" rx="[rx]" ry="[ry]"></ellipse>`
};

exports.svg_polygon = {
	title: "polygon",
	icon: '<b class="icon">pgon</b>',
	menu: 'media',
	group: "svg_node",
	properties: {
		points: {
			title: 'Points',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<polygon points="[points]"></polygon>`
};

exports.svg_polyline = {
	title: "polyline",
	icon: '<b class="icon">pline</b>',
	menu: 'media',
	group: "svg_node",
	properties: {
		points: {
			title: 'Points',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<polyline points="[points]"></polyline>`
};

exports.svg_linearGradient = {
	title: "gradient",
	icon: '<b class="icon">grad</b>',
	menu: 'media',
	group: "svg_node",
	properties: {
		id: {
			title: 'id',
			type: 'string',
			format: 'id',
			nullable: true
		},
		gradientUnits: {
			title: 'Units',
			type: 'string',
			nullable: true
		},
		gradientTransform: {
			title: 'Transform',
			type: 'string',
			nullable: true
		},
		x1: {
			title: 'x1',
			type: 'number',
			nullable: true
		},
		y1: {
			title: 'y1',
			type: 'number',
			nullable: true
		},
		x2: {
			title: 'x2',
			type: 'number',
			nullable: true
		},
		y2: {
			title: 'y2',
			type: 'number',
			nullable: true
		}
	},
	inplace: true,
	contents: "svg_stop+",
	ns: "svg",
	html: `<linearGradient id="[id]" gradientUnits="[gradientUnits]" x1="[x1]" x2="[x2]" y1="[y1]" y2="[y2]"></linearGradient>`
};

exports.svg_stop = {
	title: "stop",
	icon: '<b class="icon">stop</b>',
	menu: 'media',
	properties: {
		offset: {
			title: 'Offset',
			type: 'string',
			nullable: true
		},
		stopColor: {
			title: 'Color',
			type: 'string',
			nullable: true
		},
		stopOpacity: {
			title: 'Opacity',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	ns: "svg",
	html: `<stop offset="[offset]" stop-color="[stopColor]" stop-opacity="[stopOpacity]"></stop>`
};
