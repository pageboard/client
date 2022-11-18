// VirtualHTMLElement replaces it by a stub that calls back immediately
window.IntersectionObserver = null;

Page.setup(state => {
	if (this.isContentEditable) return;
	const opts = document.body.dataset;
	opts.sibling = 'next-sheet';
	opts.page = '.page-sheet';
	autobreakFn(opts);
	if (state.pathname.endsWith('.pdf') == false) {
		showPrintButtons(state);
	}
});

function showPrintButtons(state) {
	const root = document.documentElement;
	if (document.querySelector('html > .pdf-chooser')) return;
	root.appendChild(root.dom(`<div class="pdf-chooser">
		<a target="_blank" href="[$pathname].pdf[$query|set:pdf:[presets.const|repeat:a:preset]|query]">[preset.title]</a>
	</div>`).fuse({
		presets: [{
			const: 'ebook',
			title: '👁'
		}, {
			const: 'printer',
			title: '🖶'
		}]
	}, state.scope));
}

function autobreakFn(opts = {}) {
	if (!opts.page) opts.page = ".page";
	if (!opts.margin) opts.margin = '0px';

	// 1) activate media print rules, get @page size and margins
	// 2) traverse, "page" nodes have 'page-break-after: always', 'page-break-inside:avoid'
	// 3) page node too long is broken in several pages
	// 4) try to break text nodes, honour widows/orphans
	// 5) leaf nodes that can't fit must be resized ! (and a warning)

	// TODO set style of nodes having print style
	// page-break-inside: avoid;
	// page -break-after: always;

	const effectiveSheet = new CSSStyleSheet();
	const pageSize = {
		width: opts.width,
		height: opts.height
	};

	const innerPageSize = {
		width: `calc(${pageSize.width} - ${opts.margin} - ${opts.margin})`,
		height: `calc(${pageSize.height} - ${opts.margin} - ${opts.margin})`
	};
	const printSheet = `
	html, body {
		padding: 0;
		margin: 0;
	}
	@media screen {
		html, body {
			background: gray;
		}
		${opts.page} {
			width: ${innerPageSize.width};
			height: ${innerPageSize.height};
			margin-left: ${opts.margin};
			margin-right: ${opts.margin};
			margin-top: ${opts.margin};
			margin-bottom: ${opts.margin};
			background: white;
			overflow:hidden;
		}
	}
	@media print {
		html, body {
			background:white;
		}
		@page {
			size: ${opts.width} ${opts.height};
			margin: ${opts.margin};
		}
		${opts.page} {
			width: ${innerPageSize.width};
			height: ${innerPageSize.height};
			overflow: hidden;
		}
	}`;

	effectiveSheet.replaceSync(printSheet);
	document.adoptedStyleSheets.push(effectiveSheet);

	function fillPage(page) {
		const pageRect = page.getBoundingClientRect();
		const iter = document.createNodeIterator(page, NodeFilter.SHOW_ELEMENT, null);
		const range = new Range();
		let node;
		while ((node = iter.nextNode())) {
			if (node.children?.length) {
				continue;
			}
			const rect = node.getBoundingClientRect();
			if (Math.round((rect.bottom - pageRect.bottom) * 10) <= 0) continue;
			// TODO split text nodes using this technique:
			// https://www.bennadel.com/blog/4310-detecting-rendered-line-breaks-in-a-text-node-in-javascript.htm
			// honour orphans/widows
			if (node.previousSibling) {
				range.setStartBefore(node);
				range.setEndAfter(page);
				break;
			} else {
				Object.assign(node.style, {
					width: '100%',
					height: 'auto',
					maxWidth: innerPageSize.width,
					maxHeight: innerPageSize.height
				});
			}
		}
		if (!range.collapsed) {
			const contents = range.extractContents();
			const nextPage = contents.firstElementChild;
			if (opts.sibling) nextPage.classList.add(opts.sibling);
			page.after(nextPage);
			fillPage(nextPage);
		}
	}

	for (const page of document.querySelectorAll(opts.page)) {
		fillPage(page);
	}
}
