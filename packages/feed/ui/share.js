class HTMLElementShare extends VirtualHTMLElement {
	static get links() {
		return [{
			name: 'twitter',
			icon: `<svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path opacity="0" d="M0 0h24v24H0z"></path>
				<path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
			</svg>`,
			url: 'https://twitter.com/intent/tweet?text=[url]'
		}, {
			name: 'facebook',
			icon: `<svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path d="M16.75,9H13.5V7a1,1,0,0,1,1-1h2V3H14a4,4,0,0,0-4,4V9H8v3h2v9h3.5V12H16Z"></path>
			</svg>`,
			url: 'https://www.facebook.com/sharer/sharer.php?u=[url]'
		}, {
			name: 'linkedin',
			icon: `<svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<rect height="11" width="4" x="3" y="9"></rect>
				<circle cx="5" cy="5" r="2"></circle>
				<path d="M16.5,8.25A4.47251,4.47251,0,0,0,13,9.95343V9H9V20h4V13a2,2,0,0,1,4,0v7h4V12.75A4.5,4.5,0,0,0,16.5,8.25Z"></path>
			</svg>`,
			url: 'https://www.linkedin.com/shareArticle?mini=true&url=[url]'
		}];
	}
	build(state) {
		this.textContent = '';
		this.append(this.dom(`<div class="ui simple inline dropdown">
			<div class="title"><svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"></path></svg></div>
			<div class="list">
				<a class="item" data-share="[links.name|repeat:*:link]">[link.icon|html]</a>
			</div>
		</div>`).fuse(this.constructor, state.scope));
	}
	handleClick(e, state) {
		var item = e.target.closest('.item');
		if (!item) return;
		e.preventDefault();
		var obj = this.constructor.links.find((link) => link.name == item.dataset.share);
		if (!obj) return;
		var url = obj.url.fuse({
			url: encodeURIComponent(document.location.href)
		}, state.scope);
		window.open(url, '_blank');
	}
}

Page.init(function() {
	VirtualHTMLElement.define('element-share', HTMLElementShare);
});

