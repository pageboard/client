exports.svg = {
	title: "svg",
	icon: '<b class="icon">svg</b>',
	menu: 'widget',
	group: "block",
	properties: {
		viewBox: {
			title: 'viewBox',
			type: 'string'
		},
		width: {
			title: 'width',
			type: 'integer'
		},
		height: {
			title: 'height',
			type: 'integer'
		}
	},
	contents: "svg_defs? svg_node+",
	html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="[viewBox]" width="[width]" height="[height]"></svg>`
};

exports.text.group += ' svg_inline';

exports.svg_text = {
	title: "text",
	icon: '<i class="icon font"></i>',
	menu: 'svg',
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
	html: `<text x="[x]" y="[y]">Text</text>`
};

exports.svg_tspan = {
	title: "span",
	icon: '<i class="icon font"></i>',
	menu: 'svg',
	group: "svg_inline",
	properties: {
	},
	contents: "text*",
	inplace: true,
	inline: true,
	html: `<tspan></tspan>`
};

exports.svg_defs = {
	title: "defs",
	icon: '<b class="icon">defs</b>',
	menu: 'svg',
	contents: "svg_node+",
	inplace: true,
	html: `<defs></defs>`
};

exports.svg_group = {
	title: "group",
	icon: '<i class="clone outline icon"></i>',
	menu: 'svg',
	group: "svg_node",
	properties: {
		id: {
			title: 'id',
			type: 'string',
			format: 'id',
			nullable: true
		},
		fill: {
			title: 'fill',
			type: 'string',
			nullable: true
		},
		stroke: {
			title: 'stroke',
			type: 'string',
			nullable: true
		},
		transform: {
			title: 'transform',
			type: 'string',
			nullable: true
		}
	},
	contents: "svg_node+",
	inplace: true,
	html: `<g id="[id]" fill="[fill]" stroke="[stroke]" transform="[transform]"></g>`
};

exports.svg_path = {
	title: "path",
	icon: '<b class="icon">path</b>',
	menu: 'svg',
	group: "svg_node",
	properties: {
		d: {
			title: 'd',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	html: `<path d="[d]"></path>`
};

exports.svg_line = {
	title: "line",
	icon: '<b class="icon">line</b>',
	menu: 'svg',
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
	html: `<line x1="[x1]" y1="[y1]" x2="[x2]" y2="[y2]"></line>`
};

exports.svg_rect = {
	title: "rect",
	icon: '<i class="square outline icon"></i>',
	menu: 'svg',
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
		w: {
			title: 'width',
			type: 'number',
			nullable: true
		},
		h: {
			title: 'height',
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
	html: `<rect x="[x]" y="[y]" w="[w]" h="[h]" rx="[rx]" ry="[ry]"></rect>`
};

exports.svg_circle = {
	title: "circle",
	icon: '<i class="circle outline icon"></i>',
	menu: 'svg',
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
	html: `<circle cx="[cx]" cy="[cy]" r="[r]"></circle>`
};

exports.svg_ellipse = {
	title: "ellipse",
	icon: '<i class="circle outline icon"></i>',
	menu: 'svg',
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
	html: `<ellipse cx="[cx]" cy="[cy]" rx="[rx]" ry="[ry]"></ellipse>`
};

exports.svg_polygon = {
	title: "polygon",
	icon: '<b class="icon">pgon</b>',
	menu: 'svg',
	group: "svg_node",
	properties: {
		points: {
			title: 'points',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	html: `<polygon points="[points]"></polygon>`
};

exports.svg_polyline = {
	title: "polyline",
	icon: '<b class="icon">pline</b>',
	menu: 'svg',
	group: "svg_node",
	properties: {
		points: {
			title: 'points',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	html: `<polyline points="[points]"></polyline>`
};

exports.svg_linearGradient = {
	title: "gradient",
	icon: '<b class="icon">grad</b>',
	menu: 'svg',
	group: "svg_node",
	properties: {
		id: {
			title: 'id',
			type: 'string',
			format: 'id',
			nullable: true
		},
		gradientUnits: {
			title: 'units',
			type: 'string',
			nullable: true
		},
		gradientTransform: {
			title: 'transform',
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
	html: `<linearGradient id="[id]" gradientUnits="[gradientUnits]" x1="[x1]" x2="[x2]" y1="[y1]" y2="[y2]"></linearGradient>`
};

exports.svg_stop = {
	title: "stop",
	icon: '<b class="icon">stop</b>',
	menu: 'svg',
	properties: {
		offset: {
			title: 'offset',
			type: 'string',
			nullable: true
		},
		stopColor: {
			title: 'color',
			type: 'string',
			nullable: true
		},
		stopOpacity: {
			title: 'opacity',
			type: 'string',
			nullable: true
		}
	},
	inplace: true,
	html: `<stop offset="[offset]" stop-color="[stopColor]" stop-opacity="[stopOpacity]"></stop>`
};
