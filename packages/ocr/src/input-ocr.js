import { createWorker, PSM, setLogging } from 'tesseract.js';

class HTMLElementInputOcr extends Page.create(HTMLInputElement) {
	#ocr;
	get #video() {
		const parent = this.closest('div');
		const node = parent.querySelector('video');
		if (node) return node;
		else return parent.appendChild(this.ownerDocument.createElement('video'));
	}
	async #try() {
		const myVideo = this.#video;
		if (myVideo.readyState === myVideo.HAVE_ENOUGH_DATA) {
			const canvas = new OffscreenCanvas(myVideo.clientWidth, myVideo.clientHeight);
			canvas.getContext("2d").drawImage(myVideo, 0, 0);
			const { data } = await this.#ocr.recognize(canvas, {
				// TODO recognition on center zone
				// rectangle: { top: 0, left: 0, width: 100, height: 100 },
			});
			const re = new RegExp(this.getAttribute('regexp'), 'i');
			const block = data.blocks.find(block => re.test(block.text));
			if (block) {
				const match = block.text.match(re);
				this.value = match[0];
				await this.#destroy();
				return;
			}
		}
		requestAnimationFrame(() => this.#try());
	}
	async handleFocus(e, state) {
		if (this.isContentEditable || !this.getAttribute('regexp')) return;
		await this.#create();
	}
	async handleBlur(e, state) {
		if (this.isContentEditable) return;
		await this.#destroy();
	}
	async handleClick(e, state) {
		// toggle ?
	}
	async #create() {
		setLogging(false);
		const pw = createWorker("fra", 1, {
			corePath: new URL('./core', import.meta.url).href,
			workerPath: new URL("./worker.min.js", import.meta.url).href,
			langPath: new URL("./data", import.meta.url).href
		}, {
			tessedit_pageseg_mode: PSM.SPARSE_TEXT
		});
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: "environment" },
			audio: false
		});
		const myVideo = this.#video;
		myVideo.srcObject = stream;
		myVideo.play();
		this.#ocr = await pw;
		requestAnimationFrame(() => this.#try());
	}
	async #destroy() {
		this.#video?.remove();
		await this.#ocr?.terminate();
	}
}


Page.define('element-input-ocr', HTMLElementInputOcr, 'input');


