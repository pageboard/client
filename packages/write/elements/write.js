exports.write = {
	priority: 100,
	title: 'Write',
	dependencies: ['core', 'services'],
	bundle: true,
	standalone: true,
	virtual: true,
	html: `<html lang="[$lang]">
	<head>
		<title>[title][$parent.data.title?|pre: - ]</title>
		<meta http-equiv="Content-Security-Policy" content="[$elements|as:csp]">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<base href="[$loc.origin]">
		<link rel="stylesheet" href="[$element.stylesheets|repeat:]" data-priority="[$element.priority]" />
		<script defer src="[$element.scripts|repeat:]" data-priority="[$element.priority]"></script>
	</head>
	<body
		data-placeholder="[$element.resources.empty]"
		data-reset="[$element.resources.reset]"
		data-mode="read"
	>
	<div id="pageboard-read">
		<div class="ui bound bottom sticky wide notifications"></div>
	</div>
	<div id="pageboard-write" class="ui basic segment">
		<div id="store" class="ui inverted wide mini menu waiting">
			<div class="icon menu">
				<a class="item" data-command="save">
					<i class="checkmark icon"></i>
					Save
				</a>
				<a class="item" data-command="discard">
					<i class="cancel icon"></i>
					Discard
				</a>
				<a id="auth" class="vertically fitted item" title="Sign Out" data-command="logout">
					<i class="sign out large icon"></i>
				</a>
			</div>
			<div class="text menu">
				<div class="header item">[$parent.data.title|or:-]</div>
				<div class="item">[$parent.data.env]</div>
				<div class="item">[$parent.data.module] [$parent.data.version|slice:0:12|or:head]</div>
			</div>
			<div id="mode" class="right menu">
				<a class="vertically fitted item" title="Site map" data-command="map" href="/admin/map">
					<i class="sitemap large icon"></i>
				</a>
				<a class="vertically fitted item" title="Settings" data-command="settings" href="/admin/settings">
					<i class="cog large icon"></i>
				</a>
				<a class="vertically fitted item" data-command="translate" title="Translation" href="/admin/translations">
					<i class="language large icon"></i>[$parent.data.languages|prune:a]
				</a>
				<a class="vertically fitted item" hidden data-command="code" title="HTML Mode">
					<i class="code large icon"></i>
				</a>
				<a class="vertically fitted item" data-command="read" title="Read Mode">
					<i class="unhide large icon"></i>
				</a>
				<a class="vertically fitted item" data-command="write" title="Write Mode">
					<i class="write large icon"></i>
				</a>
			</div>
		</div>
		<div id="move" class="ui inverted tiny icon top attached menu hidden">
			<a class="item" data-command="jump-left" title="Jump Left"><i class="angle double left icon"></i></a>
			<a class="fitted item" data-command="left" title="Move Left"><i class="angle left icon"></i></a>
			<a class="item" data-command="delete" title="Delete"><i class="close icon"></i></a>
			<a class="fitted item" data-command="right" title="Move right"><i class="angle right icon"></i></a>
			<a class="item" data-command="jump-right" title="Jump right"><i class="angle double right icon"></i></a>
			<div class="right menu">
				<div class="item" id="share">
					<label class="inverted toggle checkbox" title="Toggle shared status">
						<input type="checkbox" name="standalone" value="true" />
						<span>shared</span>
					</label>
					<div class="ancestor">shared<br>ancestor</div>
					<div class="descendant">shared<br>descendant</div>
				</div>
				<a class="item" id="toggle-lock" title="Manage permissions">
					<i class="lock icon"></i>
				</a>
				<a class="item" id="toggle-expr">
					<i class="star of life icon"></i>
				</a>
			</div>
		</div>
		<div id="breadcrumb" class="ui breadcrumb inverted bottom attached menu">
			<ul>
				<li>click to select text</li>
				<li>ctrl-click to select blocks</li>
			</ul>
			<span>
				<a class="section"></a>
				<i class="right chevron icon divider"></i>
			</span>
		</div>
		<div id="menu"></div>
		<div id="form" class="ui form"></div>
		<div class="ui bound bottom sticky wide notifications"></div>
	</div>
	</body>
</html>`,
	stylesheets: [
		"../lib/components/reset.css",
		"../ui/site.css",
		"../lib/components/container.css",
		"../lib/components/divider.css",
		"../lib/components/header.css",
		"../lib/components/segment.css",
		"../lib/components/loader.css",
		"../lib/components/form.css",
		"../lib/components/input.css",
		"../lib/components/button.css",
		"../lib/components/item.css",
		"../lib/components/menu.css",
		"../lib/components/transition.css",
		"../lib/components/label.css",
		"../lib/components/image.css",
		"../lib/components/icon.css",
		"../lib/components/progress.css",
		"../lib/components/message.css",
		"../lib/components/breadcrumb.css",
		"../lib/components/sticky.css",
		"../lib/components/tab.css",
		"../lib/components/table.css",
		"../ui/write.css",
		"../ui/menu.css",
		"../ui/checkbox.css",
		"../ui/helpers/color.css",
		"../ui/helpers/href.css",
		"../lib/cropper.css",
		"../ui/helpers/crop.css"
	],
	scripts: [
		"../ui/write.js",
		"../lib/utils.js",
		"../ui/semafor.js",
		"../ui/behaviors/map.js",
		"../ui/behaviors/textarea.js",
		"../ui/filters/helper.js",
		"../ui/filters/action.js",
		"../ui/helpers/color.js",
		"../ui/helpers/datalist.js",
		"../ui/filters/element.js",
		"../ui/helpers/element-property.js",
		"../ui/filters/element-value.js",
		"../ui/helpers/binding.js",
		"../ui/filters/schema.js",
		"../ui/filters/relation.js",
		"../ui/filters/service.js",
		"../ui/notification.js",
		"../ui/behaviors/infinite-scroll.js",
		"../ui/helpers/href.js",
		"../ui/helpers/page-title-url.js",
		"../ui/helpers/page.js",
		"../ui/helpers/crop.js",
		"../ui/filters/intl.js",
		"../ui/form.js",
		"../ui/menu.js",
		"../ui/move.js",
		"../ui/breadcrumb.js",
		"../ui/store.js",
		"../ui/share.js",
		"../ui/mode.js",
		"../ui/setup.js",
		"../lib/cropper.js"
	],
	resources: {
		empty: "../ui/empty.png",
		reset: "../lib/components/reset.css",
	},
	polyfills: [
		'default',
		'Element.prototype.animate',
		'Element.prototype.dataset',
		'fetch',
		'es2015', 'es2016', 'es2017', 'es2018',
		'URL',
		'Intl.NumberFormat.~locale.[$lang]',
		`Intl.DateTimeFormat.~locale.[$lang]`,
		'smoothscroll',
		'queueMicrotask'
	],
	csp: {
		default: ["'none'"],
		'form-action': ["'self'"],
		connect: ["'self'"],
		object: ["'none'"],
		script: ["'self'"],
		frame: ["'self'"],
		style: ["'self'", "'unsafe-inline'"],
		font: ["'self'", "data:", "https:"],
		img: ["'self'", "data:", "https:"]
	}
};

exports.editor = {
	bundle: true,
	scripts: [
		"../lib/pagecut/editor.js",
		"../ui/editor.js"
	],
	stylesheets: [
		"../ui/editor.css"
	],
	fragments: [{
		path: 'body',
		attributes: {
			"class": "[$write|alt:ProseMirror:]",
			"spellcheck": "[$write|alt:false:true]",
			"contenteditable": "[$write|alt:true:]",
			"data-transition-close": "[transition.close?]",
			"data-transition-open": "[transition.open?]",
		}
	}]
};

