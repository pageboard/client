exports.write = {
	priority: 100,
	title: 'Editor',
	group: 'page',
	html: `<html lang="[$site.lang|ornull]">
	<head>
		<title>[title][$site.title|pre: - |or:]</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="icon" href="[$site.favicon|magnet:*|url]?format=ico">
		<link rel="stylesheet" href="[$elements.write.stylesheets|repeat]" />
		<script defer src="[$elements.write.scripts|repeat]"></script>
		<script defer src="[$meta.services]"></script>
	</head>
	<body
		data-devtools="[$element.resources.devtools]"
		data-placeholder="[$element.resources.empty]"
		data-reset="[$element.resources.reset]"
		data-mode="read"
	>
	<div id="pageboard-read">
		<div class="ui bound bottom sticky wide notifications"></div>
	</div>
	<div id="pageboard-write" class="ui basic segment">
		<div id="store" class="ui inverted wide mini menu">
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
			<div id="mode" class="right menu">
				<a class="vertically fitted item" data-command="code" title="HTML Mode">
					<i class="code large icon"></i>
				</a>
				<a class="vertically fitted item" data-command="read" title="Read Mode">
					<i class="unhide large icon"></i>
				</a>
				<a class="vertically fitted item" data-command="write" title="Write Mode">
					<i class="write large icon"></i>
				</a>
				<a class="ui black right corner label" data-command="write" title="Write Mode">
					<i class="write icon"></i>
				</a>
			</div>
		</div>
		<div id="breadcrumb" class="ui breadcrumb">
			No selection.
			<span>
				<a class="section"></a>
				<i class="right chevron icon divider"></i>
			</span>
		</div>
		<div id="menu"></div>
		<div id="move" class="ui inverted tiny icon menu hidden">
			<a class="item" data-command="left" title="Move left"><i class="left arrow icon"></i></a>
			<a class="item" data-command="delete" title="Delete"><i class="close icon"></i></a>
			<a class="item" data-command="right" title="Move right"><i class="right arrow icon"></i></a>
			<div class="right menu">
				<div class="item" id="share">
					<div class="ui inverted toggle checkbox checked" title="Toggle shared status">
						<input type="checkbox" name="standalone" class="hidden" value="true" tabindex="0"><label>shared</label>
					</div>
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
		"../lib/components/dropdown.css",
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
		"../lib/components/checkbox.css",
		"../lib/components/tab.css",
		"../lib/components/table.css",
		"../lib/perfect-scrollbar.css",
		"../ui/write.css",
		"../ui/menu.css",
		"../ui/inputs/href.css",
		"../lib/cropper.css",
		"../ui/inputs/crop.css"
	],
	scripts: exports.page.scripts.slice().concat([
		"../lib/jquery.min.js",
		"../lib/moment.js",
		"../lib/components/form.js",
		"../lib/components/progress.js",
		"../lib/components/dropdown.js",
		"../lib/components/transition.js",
		"../lib/components/checkbox.js",
		"../ui/write.js",
		"../lib/pageboard.js",
		"../ui/semafor.js",
		"../ui/inputs/map.js",
		"../ui/inputs/element.js",
		"../ui/inputs/element-property.js",
		"../ui/inputs/binding.js",
		"../ui/inputs/schema.js",
		"../ui/inputs/relation.js",
		"../ui/inputs/service.js",
		"../ui/notification.js",
		"../ui/inputs/href.js",
		"../ui/inputs/page-title-url.js",
		"../ui/inputs/page.js",
		"../ui/inputs/crop.js",
		"../ui/form.js",
		"../ui/menu.js",
		"../ui/move.js",
		"../ui/breadcrumb.js",
		"../ui/store.js",
		"../ui/share.js",
		"../ui/auth.js",
		"../ui/mode.js",
		"../lib/perfect-scrollbar.js",
		"../lib/infinite-scroll.js",
		"../ui/setup.js",
		"../lib/pagecut/menu.js",
		"../lib/cropper.js",
		"../lib/speakingurl.js"
	]),
	resources: {
		devTools: "../lib/prosemirror-dev-tools.min.js",
		empty: "../ui/empty.png",
		develop: "../ui/develop.js",
		editor: "../lib/pagecut/editor.js",
		readScript: "../ui/read.js",
		readStyle: "../ui/read.css",
		reset: "../lib/components/reset.css",
	}
};

