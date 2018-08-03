exports.debounce = require('debounce');
exports.fetch = require('./fetch');
exports.script = require('./script');

var domify = require('domify');
var matchdom = require('matchdom');

Object.assign(matchdom.filters, require('./filters'));

var parser = new DOMParser();

Document.prototype.dom = function(str) {
	if (/^\s*<html[\s>]/.test(str)) {
		var ndoc = parser.parseFromString(str, 'text/html');
		return this.adoptNode(ndoc.documentElement);
	}
	return domify(Array.prototype.join.call(arguments, '\n'), this);
};

Node.prototype.dom = function() {
	return domify(Array.prototype.join.call(arguments, '\n'), this.ownerDocument);
};

String.prototype.fuse = Node.prototype.fuse = function(obj, scope, filters) {
	return matchdom(this, obj, filters, {data: scope});
};

var mSym = matchdom.Symbols;
var reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);
exports.fusable = function(str) {
	return reFuse.test(str);
};

window.HTMLCustomElement = require('./HTMLCustomElement');

Page.setup(function() {
	if (exports.adv) return;
	exports.adv = true;
	if (window.parent == window) {
		console.info("Powered by https://pageboard.fr");
	}
});
