(function(Pb) {
Pb.pageSearch = {
	title: 'Page search',
	merge: function(template, dom, answer) {
		var link = template.querySelector('a');
		if (link) link.setAttribute('href', '[url]');
	}
};
})(Pageboard.bindings);

