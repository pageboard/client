class HTMLElementInputOtp extends Page.create(HTMLInputElement) {
	handleInput() {
		this.style.setProperty('--otp-digit', this.selectionStart);
	}
	handleFocus() {
		this.value = "";
	}
	paint() {
		if (this.isContentEditable) return;
		this.focus();
	}
}

Page.define('element-input-otp', HTMLElementInputOtp, 'input');
