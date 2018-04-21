(function() {
window.dataLayer = window.dataLayer || [];

function gtag() {
	dataLayer.push(arguments);
}
gtag('js', new Date());
var tag = document.head.querySelector('#gtag');
var gaid = Page.parse(tag.src).query.id;
gtag('config', gaid);
})();

