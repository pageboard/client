Pageboard.elements.login = {
	title: "Login form",
	properties: {
	},
	contents: {
	},
	group: "block",
	icon: '<i class="ui sign in icon"></i>',
	render: function(doc, block) {
		return doc.dom`<form action="/.api/login" class="ui form" method="post">
			<div class="field">
				<label>Email</label>
				<input type="text" name="email" placeholder="myname@mymail.com">
			</div>
			<button class="ui submit button" type="submit">Login</button>
		</form>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/form.css',
		'/.pageboard/semantic-ui/components/button.css'
	],
	scripts: [
		'../ui/login.js'
	]
};

