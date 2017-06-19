window.Pagecut = {modules:{}};
window.Pageboard = {
	Controls: {},
	trigger: function trigger(node, event) {
		var e = document.createEvent('Event');
		e.initEvent(event, true, true);
		node.dispatchEvent(e);
		if (window.Pageboard.editor) window.Pageboard.editor.focus();
	},
	uiLoad: function uiLoad(what, p) {
		var classList = what.classList;
		classList.add('loading');
		return p.catch(function(err) {
			classList.remove('loading');
			Pageboard.notify("Loading error", err);
			// rethrow, we don't want to show any result
			throw err;
		}).then(function(res) {
			classList.remove('loading');
			return res;
		});
	},
	genId: function genId() {
		var arr = new Uint8Array(8);
		window.crypto.getRandomValues(arr);
		var str = "", byte;
		for (var i=0; i < arr.length; i++) {
			byte = arr[i].toString(16);
			if (byte.length == 1) byte = "0" + byte;
			str += byte;
		}
		return str;
	}
};

Page.setup(function(state) {
	Pageboard.setup();
});


