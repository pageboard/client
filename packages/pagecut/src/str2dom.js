const map = {
	legend: [1, '<fieldset>', '</fieldset>'],
	tr: [2, '<table><tbody>', '</tbody></table>'],
	col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
};
// for script/link/style tags to work in IE6-8, you have to wrap
// in a div with a non-whitespace character in front, ha!
const defaultWrap = [0, '', ''];

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @param {String} namespace
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

const nsuris = {
	xml: 'http://www.w3.org/XML/1998/namespace',
	svg: 'http://www.w3.org/2000/svg',
	xlink: 'http://www.w3.org/1999/xlink',
	html: 'http://www.w3.org/1999/xhtml',
	mathml: 'http://www.w3.org/1998/Math/MathML'
};
let domParser;

export default function parse(html, {doc, ns, frag}) {
	if (typeof html != 'string') throw new TypeError('String expected');

	// default to the global `document` object
	if (!doc) doc = document;

	// tag name
	const m = /<([\w:]+)/.exec(html);
	if (!m) {
		return resultStr(html, doc, frag);
	}

	html = html.trim();

	const tag = m[1];
	let el;
	if (tag == "html") {
		if (!domParser) domParser = new DOMParser();
		el = domParser.parseFromString(html, 'text/html');
		return doc.adoptNode(el.documentElement);
	} else if (tag == 'body') {
		el = doc.createElement('html');
		el.innerHTML = html;
		return el.removeChild(el.lastChild);
	}

	// wrap map
	const wrap = map[tag] || defaultWrap;
	let depth = wrap[0];
	const prefix = wrap[1];
	const suffix = wrap[2];

	if (ns) {
		el = doc.createElementNS(nsuris[ns] || ns, 'div');
	} else {
		el = doc.createElement('div');
	}
	el.innerHTML = prefix + html + suffix;
	while (depth--) el = el.lastChild;

	return result(el, doc, frag);
}

function result(el, doc, frag) {
	let ret;
	if (!frag && el.firstChild == el.lastChild) {
		// one element
		ret = el.removeChild(el.firstChild);
	} else {
		// several elements
		ret = doc.createDocumentFragment();
		while (el.firstChild) {
			ret.appendChild(el.firstChild);
		}
	}
	return ret;
}
function resultStr(str, doc, frag) {
	const el = doc.createTextNode(str);
	let ret = el;
	if (frag) {
		ret = doc.createDocumentFragment();
		ret.appendChild(el);
	}
	return ret;
}
