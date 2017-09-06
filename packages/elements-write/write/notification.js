(function(Pageboard) {

var root;
var list = [];

Pageboard.notify = function(title, obj) {
	var type = 'info';
	var text;
	if (obj == null) {
		obj = {};
	} else if (obj instanceof Error) {
		type = 'negative';
		text = obj.toString();
		obj = {};
	} else if (typeof obj == "string") {
		text = obj;
		obj = {};
	} else {
		text = obj.text || null;
	}
	if (obj.type) type = obj.type;
	if (list.length) {
		var last = list[list.length - 1];
		if ((last.title == title && last.text == text) || (last.label && last.label == obj.label)) {
			if (last.node) {
				last.node.remove();
			} else {
				// do nothing
				console.info("Repeated notification", title);
				return;
			}
		}
	}
	var item = {
		title: title,
		text: text,
		label: obj.label
	};
	list.push(item);

	var parent = Pageboard.notify.dom();

	var msg = document.dom`<div class="ui ${type} message">
		<i class="close icon"></i>
		<div class="header">${title}</div>
		${withText(text)}
	</div>`;

	if (obj.timeout) {
		item.node = msg;
		setTimeout(function() {
			if (msg.parentNode) $(msg).transition('fade down', function() {
				msg.remove();
			});
		}, obj.timeout * 1000);
	}

	parent.appendChild(msg);
};

function withText(text) {
	if (text) return document.dom`<p>${text}</p>`;
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
