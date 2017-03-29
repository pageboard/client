(function(exports) {

if (!exports.link) exports.link = {};

exports.link.view = function(doc, block) {
	var anchor = doc.createElement('a');
	anchor.setAttribute('href', block.data.url || '');
	if (block.data.target) anchor.setAttribute('target', block.data.target);
	return anchor;
};

})(window.Pagecut.modules);
