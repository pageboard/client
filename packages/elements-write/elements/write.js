Pageboard.elements.write = {
	priority: 100,
	replaces: 'doc',
	title: 'Editor',
	group: 'page',
	standalone: true,
	html: `<html lang="[$site.lang]">
	<head>
		<title>[title]</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="icon" href="[$site.favicon|magnet:*|url]?format=ico">
	</head>
	<body
		data-css="[paths.0]"
		data-js="[paths.1]"
		data-devtools="[paths.2]"
		data-placeholder="[paths.3]"
	>
	<div id="pageboard-read">
		<div class="ui bound bottom sticky wide notifications"></div>
	</div>
	<div id="pageboard-write" class="ui basic loading segment">
		<div id="store" class="ui inverted wide mini menu">
			<a class="vertically fitted item" data-command="view">
				<i class="unhide large icon"></i>
				<i class="hide large icon"></i>
			</a>
			<a class="item" data-command="save">
				<i class="checkmark icon"></i>
				Save
			</a>
			<a class="item" data-command="discard">
				<i class="cancel icon"></i>
				Discard
			</a>
			<div class="right icon menu">
				<div class="ui simple dropdown item">
					<i class="dropdown icon"></i>
					<div class="menu">
	<!--					<a class="item">My account</a>-->
						<a class="item" href="/.api/auth/logout">Log out</a>
					</div>
				</div>
			</div>
		</div>
		<div id="move" class="ui tiny icon menu">
			<a class="item" data-command="left"><i class="left arrow icon"></i></a>
			<a class="item" data-command="delete"><i class="close icon"></i></a>
			<a class="item" data-command="right"><i class="right arrow icon"></i></a>
			<div class="right menu">
				<div class="item" id="share">
					<div class="ui toggle checkbox checked" title="">
						<input type="checkbox" name="standalone" class="hidden" value="true" tabindex="0"><label>shared</label>
					</div>
					<div class="ancestor">shared<br>ancestor</div>
					<div class="descendant">shared<br>descendant</div>
				</div>
			</div>
		</div>
		<div id="breadcrumb" class="ui breadcrumb">
			<a class="section"></a>
			<i class="right chevron icon divider"></i>
		</div>
		<div id="menu"></div>
		<div id="form" class="ui form"></div>
		<div class="ui bound bottom sticky wide notifications"></div>
	</div>
	</body>
</html>`,
	fuse: function(node, d, scope) {
		node.fuse({
			paths: this.resources
		}, scope);
	},
	stylesheets: [
		"../lib/components/reset.css",
		"../ui/site.css",
		"../lib/components/container.css",
		"../lib/components/segment.css",
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
	scripts: Pageboard.elements.page.scripts.slice(0, 3).concat([
		Pageboard.elements.site.resources[1],
		"../lib/jquery.min.js",
		"../lib/moment.js",
		"../lib/dom4.js",
		"../lib/components/form.js",
		"../lib/components/progress.js",
		"../lib/components/dropdown.js",
		"../lib/components/transition.js",
		"../lib/components/checkbox.js",
		"../ui/write.js",
		"../ui/semafor.js",
		"../ui/inputs/map.js",
		"../ui/inputs/element.js",
		"../ui/inputs/element-property.js",
		"../ui/inputs/binding.js",
		"../ui/inputs/service.js",
		"../lib/pretty-bytes.js",
		"../ui/notification.js",
		"../ui/inputs/href.js",
		"../ui/inputs/crop.js",
		"../ui/form.js",
		"../ui/menu.js",
		"../ui/move.js",
		"../ui/breadcrumb.js",
		"../ui/store.js",
		"../ui/share.js",
		"../lib/perfect-scrollbar.js",
		"../lib/infinite-scroll.js",
		"../ui/setup.js",
		"../lib/pagecut/menu.js",
		"../lib/cropper.js",
		"../lib/speakingurl.js"
	]),
	resources: [
		"../ui/read.css",
		"../lib/pagecut/editor.js",
		"../lib/prosemirror-dev-tools.min.js",
		"../ui/empty.png"
	]
};

