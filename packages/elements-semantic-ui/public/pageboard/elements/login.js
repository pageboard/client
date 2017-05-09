(function(exports) {

exports.login = Object.assign(exports.login || {}, {
	title: "Login form",
	properties: {
	},
	contents: {
	},
	group: "block",
	icon: '<i class="ui sign in icon"></i>',
	view: function(doc, block) {
		return doc.dom`<form action="/api/login" class="ui form" method="post">
			<div class="field">
				<label>Email</label>
				<input type="text" name="email" placeholder="myname@mymail.com">
			</div>
			<button class="ui submit button" type="submit">Login</button>
		</form>`;
	},
	stylesheets: [
		'/public/semantic-ui/components/form.css',
		'/public/semantic-ui/components/button.css'
	],
	scripts: [
		'/public/pageboard/ui/login.js'
	]
});

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

