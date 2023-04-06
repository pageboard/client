Page.setup(state => {
	removePrintButtons();
	const opts = document.body.dataset;
	const { width = '210mm', height = '297mm', margin = '0mm' } = opts;
	const pageBox = { width, height, margin };
	const screenBox = convertUnits(pageBox);
	const className = 'page-sheet';
	state.scope.printStyleSheet = printStyle(className, pageBox, screenBox);
	if (state.scope.$write) {
		return;
	}
	autobreakFn(className, screenBox);
	pageNumbering(className);
	if (state.pathname.endsWith('.pdf') == false) {
		showPrintButtons(state, opts.preset);
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

function showPrintButtons(state, preset) {
	const root = document.documentElement;
	const target = {
		pathname: state.pathname + ".pdf",
		query: state.query
	};
	if (preset) target.query.pdf = preset;
	root.appendChild(root.dom(`<div class="pdf-menu">
		<a target="_blank" href="${state.format(target)}">⎙</a>
	</div>`));
}

function removePrintButtons() {
	document.querySelector('html > .pdf-menu')?.remove();
}

function printStyle(className, pageBox, { width, height, margin }) {
	const effectiveSheet = new CSSStyleSheet();
	const innerPageSize = {
		width: `calc(${width} - ${margin} - ${margin})`,
		height: `calc(${height} - ${margin} - ${margin})`
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
		.${className} {
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
		[contenteditable] .${className} {
			border-color: rgba(0,0,0,0.05);
		}
	}
	@media print {
		html, body {
			background:white;
		}
		@page {
			size: ${pageBox.width} ${pageBox.height};
			margin: ${pageBox.margin};
		}
		.${className} {
			width: ${innerPageSize.width};
			height: ${innerPageSize.height};
			overflow: hidden;
		}
	}`;

	effectiveSheet.replaceSync(printSheet);
	document.adoptedStyleSheets.push(effectiveSheet);
	return effectiveSheet;
}

function autobreakFn(className, {
	margin,
	width,
	height
}) {
	// 1) activate media print rules, get @page size and margins
	// 2) traverse, "page" nodes have 'page-break-after: always', 'page-break-inside:avoid'
	// 3) page node too long is broken in several pages
	// 4) try to break text nodes, honour widows/orphans
	// 5) leaf nodes that can't fit must be resized ! (and a warning)

	// TODO set style of nodes having print style
	// page-break-inside: avoid;
	// page -break-after: always;

	const innerPageSize = {
		width: `calc(${width} - ${margin} - ${margin})`,
		height: `calc(${height} - ${margin} - ${margin})`
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
				// TODO something more specific
				Object.assign(node.style, {
					maxWidth: innerPageSize.width,
					maxHeight: innerPageSize.height
				});
			}
		}
		if (!range.collapsed) {
			const contents = range.extractContents();
			const nextPage = contents.firstElementChild;
			nextPage.classList.add(className + '-next');
			sheet.after(nextPage);
			fillSheet(nextPage);
		}
	}

	for (const sheet of document.querySelectorAll(`.${className}`)) {
		fillSheet(sheet);
	}
}

function pageNumbering(className) {
	const sheets = document.querySelectorAll(`.${className}`);
	let offset = 0;
	let first = 0;
	for (let i = 0; i < sheets.length; i++) {
		const sheet = sheets[i];
		if (sheet.classList.contains(className + '-skip')) {
			offset += 1;
		}
		if (i === 0) {
			first = offset;
			sheet.classList.add(className + '-first');
		} else if (i === sheets.length - 1) {
			sheet.classList.add(className + '-last');
		}
		sheet.classList.add(className + ((i + offset) % 2 === 0 ? '-right' : '-left'));
	}
	document.body.style.counterSet = [
		'sheet', -first,
		'sheets', sheets.length - offset
	].join(' ');
}

function convertUnits(styles) {
	const d = document.body.appendChild(document.createElement('div'));
	Object.assign(d.style, styles);
	const obj = {};
	const cs = window.getComputedStyle(d);
	for (const key of Object.keys(styles)) obj[key] = cs[key];
	d.remove();
	obj.height = Math.floor(parseInt(obj.height) * 10) / 10 + 'px';
	obj.width = Math.ceil(parseInt(obj.width) * 10) / 10 + 'px';
	obj.margin = Math.round(parseInt(obj.margin) * 10) / 10 + 'px';
	return obj;
}
