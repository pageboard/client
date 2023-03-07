Page.setup(state => {
	const opts = document.body.dataset;
	opts.prefix = 'page-sheet-';
	opts.page = '.page-sheet';
	state.scope.printStyleSheet = printStyle(opts);
	if (state.scope.$write) return;
	autobreakFn(opts);
	pageNumbering(opts);
	if (state.pathname.endsWith('.pdf') == false) {
		showPrintButtons(state, opts);
	} else {
		state.scope.observer?.disconnect();
		delete state.scope.observer;
	}
});

Page.close(state => {
	const ass = document.adoptedStyleSheets;
	const index = ass.indexOf(state.scope.printStyleSheet);
	delete state.scope.printStyleSheet;
	if (index >= 0) ass.splice(index, 1);
});

function showPrintButtons(state, { preset }) {
	const root = document.documentElement;
	if (document.querySelector('html > .pdf-menu')) return;
	const target = {
		pathname: state.pathname + ".pdf",
		query: state.query
	};
	if (preset) target.query.pdf = preset;
	root.appendChild(root.dom(`<div class="pdf-menu">
		<a target="_blank" href="${state.format(target)}">⎙</a>
	</div>`));
}

function printStyle({
	prefix = "",
	page = ".page",
	margin = "0px",
	width = '210mm',
	height = '270mm'
}) {
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
			margin: 10px;
			width: ${innerPageSize.width};
			height: ${innerPageSize.height};
			border-left-width: ${margin};
			border-right-width: ${margin};
			border-top-width: ${margin};
			border-bottom-width: ${margin};
			border-color:transparent;
			border-style: solid;
			background: white;
			overflow:hidden;
		}
		[contenteditable] ${page} {
			border-color: rgba(0,0,0,0.05);
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
	return effectiveSheet;
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
	const pageSize = {
		width,
		height
	};
	const innerPageSize = {
		width: `calc(${pageSize.width} - ${margin} - ${margin})`,
		height: `calc(${pageSize.height} - ${margin} - ${margin})`
	};

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
}

function pageNumbering({ page, prefix }) {
	const sheets = document.querySelectorAll(page);
	let offset = 0;
	let first = 0;
	for (let i = 0; i < sheets.length; i++) {
		const sheet = sheets[i];
		if (sheet.classList.contains(prefix + 'skip')) {
			offset += 1;
		}
		if (i === 0) {
			first = offset;
			sheet.classList.add(prefix + 'first');
		} else if (i === sheets.length - 1) {
			sheet.classList.add(prefix + 'last');
		}
		sheet.classList.add(prefix + ((i + offset) % 2 === 0 ? 'left' : 'right'));
	}
	document.body.style.counterSet = [
		'sheet', -first,
		'sheets', sheets.length - offset
	].join(' ');
}
