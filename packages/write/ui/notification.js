(function(Pageboard) {

const roots = {};
const list = [];

Pageboard.notify = function(title, obj) {
	let type = 'info';
	let text;
	if (!obj && typeof title != "string") {
		obj = title;
		title = "";
	}
	if (obj == null) {
		obj = {};
	} else if (obj.message) {
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
		const last = list[list.length - 1];
		if ((last.title == title && last.text == text) || (last.label && last.label == obj.label)) {
			if (last.node) {
				last.node.remove();
			} else {
				// do nothing
				// eslint-disable-next-line no-console
				console.debug("Repeated notification", title);
				return;
			}
		}
	}
	if (!title && text) {
		title = text;
		text = "";
	}
	const item = {
		title: title,
		text: text,
		label: obj.label
	};
	list.push(item);

	const parent = Pageboard.notify.dom(obj.where);

	const msg = document.dom(`<div class="ui ${type} message">
		<i class="close icon"></i>
		<div class="header">${title}</div>
		${withText(text)}
	</div>`);

	if (obj.timeout) {
		item.node = msg;
		setTimeout(() => {
			if (msg.parentNode) msg.animate(
				[{ opacity: 1.0 }, { opacity: 0 }], { duration: 1000 }
			).onfinish = () => msg.remove();
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
	const root = document.querySelector(`#pageboard-${where} > .notifications`);
	roots[where] = root;
	root.addEventListener('click', (e) => {
		const msg = e.target.closest('.message');
		if (!msg) return;
		let index = 0;
		let cur = msg;
		while ((cur = cur.previousSibling)) {
			index++;
		}
		list.splice(index, 1);
		msg.remove();
	});
	return root;
};

Pageboard.notify.clear = function(where) {
	const parent = Pageboard.notify.dom(where);
	if (parent) parent.textContent = "";
};

Pageboard.notify.destroy = function() {
	// TODO
};

})(window.Pageboard);
