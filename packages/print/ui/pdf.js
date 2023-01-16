Page.setup(state => {
	if (this.isContentEditable) return;
	const opts = document.body.dataset;
	opts.prefix = 'page-sheet-';
	opts.page = '.page-sheet';
	state.ui.printStyleSheet = autobreakFn(opts);
	if (state.pathname.endsWith('.pdf') == false) {
		showPrintButtons(state, opts);
	} else {
		state.ui.observer?.disconnect();
		delete state.ui.observer;
	}
	// bug in window-page: Page.close is called on opening
	Page.close(state => {
		const ass = document.adoptedStyleSheets;
		const index = ass.indexOf(state.ui.printStyleSheet);
		delete state.ui.printStyleSheet;
		if (index >= 0) ass.splice(index, 1);
	});
});

function showPrintButtons(state, { preset }) {
	const root = document.documentElement;
	if (document.querySelector('html > .pdf-menu')) return;
	const target = state.copy();
	target.pathname += ".pdf";
	if (preset) target.query.pdf = preset;
	root.appendChild(root.dom(`<div class="pdf-menu">
		<a target="_blank" href="${target.toString()}">⎙</a>
	</div>`));
}

function autobreakFn({
	prefix = "",
	page = ".page",
	margin = "0px",
	width = '210mm',
	height = '270mm'
}) {
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
		width,
		height
	};

	const innerPageSize = {
		width: `calc(${pageSize.width} - ${margin} - ${margin})`,
		height: `calc(${pageSize.height} - ${margin} - ${margin})`
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
		${page} {
			width: ${innerPageSize.width};
			height: ${innerPageSize.height};
			border-left-width: ${margin};
			border-right-width: ${margin};
			border-top-width: ${margin};
			border-bottom-width: ${margin};
			border-color: rgba(0,0,0,0.04);
			border-style: solid;
			background: white;
			overflow:hidden;
		}
	}
	@media print {
		html, body {
			background:white;
		}
		@page {
			size: ${width} ${height};
			margin: ${margin};
		}
		${page} {
			width: ${innerPageSize.width};
			height: ${innerPageSize.height};
			overflow: hidden;
		}
	}`;

	effectiveSheet.replaceSync(printSheet);
	document.adoptedStyleSheets.push(effectiveSheet);

	function fillSheet(sheet) {
		const pageRect = sheet.getBoundingClientRect();
		const iter = document.createNodeIterator(sheet, NodeFilter.SHOW_ELEMENT, null);
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
				range.setEndAfter(sheet);
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
			nextPage.classList.add(prefix + 'next');
			sheet.after(nextPage);
			fillSheet(nextPage);
		}
	}

	for (const sheet of document.querySelectorAll(page)) {
		fillSheet(sheet);
	}
	const sheets = document.querySelectorAll(page);
	document.body.style.counterSet = 'pages ' + sheets.length;
	for (let i = 0; i < sheets.length; i++) {
		const sheet = sheets[i];
		if (i === 0) sheet.classList.add(prefix + 'first');
		else if (i === sheets.length - 1) sheet.classList.add(prefix + 'last');
		sheet.classList.add(prefix + (i % 2 === 0 ? 'left' : 'right'));
	}
	return effectiveSheet;
}
