(function(Pageboard) {

var root;
var list = [];

Pageboard.notify = function(title, text) {
	text = text.toString();
	if (list.length) {
		var last = list[list.length - 1];
		if (last.title == title && last.text == text) {
			// do nothing
			console.info("Repeated error", title);
			return;
		}
	}
	list.push({
		title: title,
		text: text
	});
	var parent = Pageboard.notify.dom();

	var msg = html`<div class="ui attached negative message">
		<i class="close icon"></i>
		<div class="header">${title}</div>
		${withText(text)}
	</div>`;

	parent.appendChild(msg);
};

function withText(text) {
	if (text) return html`<p>${text}</p>`;
	else return '';
}

Pageboard.notify.dom = function() {
	if (root) return root;
	root = document.getElementById('notifications');
	root.addEventListener('click', function(e) {
		var msg = e.target.closest('.message');
		if (!msg) return;
		var index = 0;
		var cur = msg;
		while (cur=cur.previousSibling) {
			index++;
		}
		list.splice(index, 1);
		msg.remove();
	});
	return root;
};

})(window.Pageboard);
