/* global $ */
(function(Pageboard) {

var roots = {};
var list = [];

Pageboard.notify = function(title, obj) {
	var type = 'info';
	var text;
	if (!obj && typeof title != "string") {
		obj = title;
		title = "";
	}
	if (obj == null) {
		obj = {};
	} else if (obj.stack && obj.message) {
		console.error(obj);
		if (obj.body) {
			title = obj.message;
			text = obj.body;
		} else {
			title = obj.message;
		}
		type = 'negative';
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
	if (!title && text) {
		title = text;
		text = "";
	}
	var item = {
		title: title,
		text: text,
		label: obj.label
	};
	list.push(item);

	var parent = Pageboard.notify.dom(obj.where);

	var msg = document.dom(`<div class="ui ${type} message">
		<i class="close icon"></i>
		<div class="header">${title}</div>
		${withText(text)}
	</div>`);

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
	if (text) return `<p>${text}</p>`;
	else return '';
}

Pageboard.notify.dom = function(where) {
	if (!where) where = 'write';
	if (roots[where]) return roots[where];
	var root = document.querySelector(`#pageboard-${where} > .notifications`);
	roots[where] = root;
	root.addEventListener('click', function(e) {
		var msg = e.target.closest('.message');
		if (!msg) return;
		var index = 0;
		var cur = msg;
		while ((cur = cur.previousSibling)) {
			index++;
		}
		list.splice(index, 1);
		msg.remove();
	});
	return root;
};

Pageboard.notify.clear = function(where) {
	var parent = Pageboard.notify.dom(where);
	if (parent) parent.textContent = "";
};

Pageboard.notify.destroy = function() {
	// TODO
};

})(window.Pageboard);
