module.exports = parse;

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
	bugTestDiv = document.createElement('div');
	// Setup
	bugTestDiv.innerHTML = '	<link/><table></table><a href="/a">a</a><input type="checkbox"/>';
	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
	bugTestDiv = undefined;
}

var map = {
	legend: [1, '<fieldset>', '</fieldset>'],
	tr: [2, '<table><tbody>', '</tbody></table>'],
	col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
	// for script/link/style tags to work in IE6-8, you have to wrap
	// in a div with a non-whitespace character in front, ha!
	_default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

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

var nsuris = {
	xml: 'http://www.w3.org/XML/1998/namespace',
	svg: 'http://www.w3.org/2000/svg',
	xlink: 'http://www.w3.org/1999/xlink',
	html: 'http://www.w3.org/1999/xhtml',
	mathml: 'http://www.w3.org/1998/Math/MathML'
};
var domParser;

function parse(html, {doc, ns, frag}) {
	if ('string' != typeof html) throw new TypeError('String expected');

	// default to the global `document` object
	if (!doc) doc = document;

	// tag name
	var m = /<([\w:]+)/.exec(html);
	if (!m) {
		return resultStr(html, doc, frag);
	}

	html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

	var tag = m[1];
	var el;
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
	var wrap = map[tag] || map._default;
	var depth = wrap[0];
	var prefix = wrap[1];
	var suffix = wrap[2];

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
	var ret;
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
	var el = doc.createTextNode(str);
	var ret = el;
	if (frag) {
		ret = doc.createDocumentFragment();
		ret.appendChild(el);
	}
	return ret;
}
