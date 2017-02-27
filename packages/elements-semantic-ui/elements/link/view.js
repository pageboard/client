(function(exports) {

if (!exports.link) exports.link = {};

exports.link.view = function(doc, block) {
	var anchor = doc.createElement('a');
	anchor.href = block.url || '?';
	anchor.setAttribute("block-content", "content");
	return anchor;
};

})(window.Pagecut.modules);
