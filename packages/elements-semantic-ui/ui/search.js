(function(Pb) {
Pb.pageSearch = {
	title: 'Page search',
	merge: function(template, dom, answer) {
		var link = template.querySelector('a');
		if (link) link.setAttribute('href', '[url]');
		return Pb.default.merge(template, dom, answer);
	}
};
})(Pageboard.bindings);

