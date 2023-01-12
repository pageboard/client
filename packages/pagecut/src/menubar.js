import { MenuItem, renderGrouped } from "prosemirror-menu";

export { MenuItem };

export class MenuBar {
	#update;
	constructor({ place, items, view }) {
		this.dom = place;
		const { update, dom } = renderGrouped(view, items);
		this.#update = update;
		place.textContent = "";
		place.classList.add('ProseMirror-menu');
		place.appendChild(place.ownerDocument.adoptNode(dom));
	}
	update(state) {
		this.#update(state);
	}
}
