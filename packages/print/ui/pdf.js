class HTMLElementBodyPrint extends Page.create(HTMLBodyElement) {
	#stylesheet;

	static defaults = {
		dataFoldWidth: x => parseFloat(x) || 0,
		dataCounterOffset: x => parseInt(x) || 0,
		dataWidth: x => parseFloat(x) || 210,
		dataHeight: x => parseFloat(x) || 297,
		dataMargin: x => parseFloat(x) || 0,
		dataPreset: null
	};

	patch(state) {
		const { pages, foldWidth } = state.query;
		if (pages != null && /^\d+-?\d*$/.test(pages)) {
			state.vars.pages = true;
		}
		if (foldWidth != null) {
			document.body.dataset.foldWidth = foldWidth;
			state.vars.foldWidth = true;
		}
	}
	paint(state) {
		this.#removePrintButtons();
		const opts = this.options;
		if (window.devicePixelRatio < 4 && window.matchMedia('print').matches) {
			// TODO
		}

		this.#insertPrintStyle(
			this.#roundDims(this.#convertToPx({
				width: `${opts.width}mm`,
				height: `${opts.height}mm`,
				margin: `${opts.margin}mm`,
				foldWidth: `${opts.foldWidth}mm`
			})),
			opts
		);
		if (state.scope.$write) {
			return;
		}
		const className = 'page-sheet';
		this.#autobreakFn(className);
		this.#pageNumbering(opts.counterOffset, className);

		if (state.vars.pages) {
			this.#prunePages(
				Array.from(document.body.querySelectorAll(`.${className}`)),
				state.query.pages
			);
		}
		if (state.pathname.endsWith('.pdf') == false) {
			this.#showPrintButtons(state, opts.preset);
		} else {
			state.scope.observer?.disconnect();
			delete state.scope.observer;
		}
	}
	close() {
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
			item => item != this.#stylesheet
		);
		this.#stylesheet = null;
	}
	// https://unused-css.com/tools/border-gradient-generator
	#insertPrintStyle(sheet, page) {
		const { margin, width, height, foldWidth } = sheet;
		const actualWidth = page.width * (page.foldWidth ? 2 : 1) + page.foldWidth;
		const actualHeight = page.height;
		const effectiveSheet = new CSSStyleSheet();
		// candidate for https://css-tricks.com/css-modules-the-native-ones/
		const printSheet = `
			body {
				--print-width: ${actualWidth}mm;
				--print-height: ${actualHeight}mm;
				--page-width: ${width}px;
				--page-height: ${height}px;
				--page-margin:${margin}px;
				--page-fold-width: ${foldWidth}px;
				--page-fold-smooth: ${foldWidth ? 2 : 0}mm;
			}
			@page {
				size: ${actualWidth}mm ${actualHeight}mm;
				margin: 0;
			}`;
		effectiveSheet.replaceSync(printSheet);
		this.#stylesheet = effectiveSheet;
		document.adoptedStyleSheets.push(effectiveSheet);
		return effectiveSheet;
	}
	#prunePages(sheets, range) {
		if (range.endsWith('-')) range += sheets.length;
		else if (!range.includes('-')) range += '-' + range;
		const [start, end] = range.split('-');
		for (let i = 1; i <= sheets.length; i++) {
			if (i < start || i > end) sheets[i - 1].remove();
		}
	}
	#autobreakFn(className) {
		function checkRange(rect, range) {
			const rangeRect = range.getBoundingClientRect();
			return Math.round((rangeRect.bottom - rect.bottom) * 10) > 0;
		}
		function findRangeStart(obj, parent) {
			const { rect, range } = obj;
			for (let i = 0; i < parent.childNodes.length; i++) {
				const node = parent.childNodes[i];
				if (node.nodeType == 1) {
					range.setEndAfter(node);
					if (checkRange(rect, range)) {
						if (node.childNodes.length == 0) {
							// leaf node
						} else {
							const breakInside = window.getComputedStyle(node).breakInside;
							if (['avoid', 'avoid-page'].includes(breakInside) == false) {
								findRangeStart(obj, node);
							}
						}
						return true;
					}
				} else {
					for (let j = 0; j < node.length; j++) {
						range.setEnd(node, j + 1);
						if (checkRange(rect, range)) {
							// one step back
							range.setEnd(node, j);
							return true;
						}
					}
				}
			}
		}

		function fillSheet(sheet) {
			const obj = {
				rect: sheet.getBoundingClientRect(), // odd that range(sheet).getBounding.. doesn't work - check it
				range: new Range()
			};
			obj.range.setStart(sheet, 0);
			if (findRangeStart(obj, sheet)) {
				obj.range.setStart(obj.range.endContainer, obj.range.endOffset);
				obj.range.setEndAfter(sheet);
				const contents = obj.range.extractContents();
				const nextPage = contents.firstElementChild;
				if (nextPage.isEqualNode(sheet) == false) {
					nextPage.classList.add(className + '-next');
					sheet.after(nextPage);
					fillSheet(nextPage);
				} else {
					sheet.classList.add(className + '-error');
				}
			}
		}

		for (const sheet of document.querySelectorAll(`.${className}`)) {
			fillSheet(sheet);
		}
	}

	#pageNumbering(start, className) {
		const sheets = document.querySelectorAll(`.${className}`);
		let offset = Number.isNaN(start) ? 0 : start;
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

	#showPrintButtons(state, preset) {
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

	#removePrintButtons() {
		document.querySelector('html > .pdf-menu')?.remove();
	}

	#convertToPx(styles) {
		const d = document.body.appendChild(document.createElement('div'));
		d.style.position = 'absolute';
		const obj = {};
		for (const [name, value] of Object.entries(styles)) {
			d.style.width = value;
			obj[name] = parseFloat(window.getComputedStyle(d).width);
		}
		d.remove();
		return obj;
	}

	#roundDims(box) {
		let w = Math.round(box.width);
		const h = box.height;
		const ch = w * (box.height / box.width);
		if (ch > h) w += -1;
		return {
			margin: Math.round(box.margin),
			foldWidth: Math.round(box.foldWidth),
			width: w,
			height: Math.floor(h)
		};
	}
}
Page.define(`element-print`, HTMLElementBodyPrint, 'body');
