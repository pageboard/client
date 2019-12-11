exports.li = {
	title: 'Item',
	inplace: true,
	contents: "inline*",
	icon: '<i class="list icon"></i>',
	html: `<li></li>`,
};

exports.ul = {
	title: 'List',
	contents: "li+",
	group: "block",
	icon: '<i class="list ul icon"></i>',
	html: `<ul></ul>`,
};

exports.ol = {
	title: 'Ordered List',
	contents: "li+",
	group: "block",
	icon: '<i class="list ol icon"></i>',
	html: `<ol></ol>`,
};

