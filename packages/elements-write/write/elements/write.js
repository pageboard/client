Pageboard.elements.write = {
	priority: -100,
	replaces: 'doc',
	title: 'Editor',
	group: 'page',
	standalone: true,
	render: function(doc, block) {
		doc.body.innerHTML = `
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
	`;
		doc.head.insertAdjacentHTML('beforeEnd', "\n" +
			'<link rel="icon" href="/.pageboard/statics/pageboard.ico" />');
		return doc.body;
	},
	stylesheets: [
		"../ui/lib/components/reset.css",
		"../ui/site.css",
		"../ui/lib/components/container.css",
		"../ui/lib/components/segment.css",
		"../ui/lib/components/form.css",
		"../ui/lib/components/dropdown.css",
		"../ui/lib/components/input.css",
		"../ui/lib/components/button.css",
		"../ui/lib/components/item.css",
		"../ui/lib/components/menu.css",
		"../ui/lib/components/transition.css",
		"../ui/lib/components/label.css",
		"../ui/lib/components/image.css",
		"../ui/lib/components/icon.css",
		"../ui/lib/components/progress.css",
		"../ui/lib/components/message.css",
		"../ui/lib/components/breadcrumb.css",
		"../ui/lib/components/sticky.css",
		"../ui/lib/components/checkbox.css",
		"../ui/lib/components/tab.css",
		"../ui/lib/components/table.css",
		"../ui/lib/perfect-scrollbar.css",
		"../ui/write.css",
		"../ui/menu.css",
		"../ui/inputs/href.css",
		"../ui/lib/cropper.min.css",
		"../ui/inputs/crop.css"
	],
	scripts: [
		"/.pageboard/read/pageboard.js",
		"/.pageboard/read/custom-elements.min.js",
		"/.pageboard/read/window-page.js",
		"../ui/lib/jquery.min.js",
		"../ui/lib/moment.js",
		"../ui/lib/dom4.js",
		"../ui/lib/components/form.js",
		"../ui/lib/components/progress.js",
		"../ui/lib/components/dropdown.js",
		"../ui/lib/components/transition.js",
		"../ui/lib/components/checkbox.js",
		"/.pageboard/read/dom-template-strings.js",
		"../ui/write.js",
		"../ui/semafor.js",
		"../ui/inputs/map.js",
		"../ui/inputs/element.js",
		"../ui/inputs/element-property.js",
		"../ui/inputs/binding.js",
		"../ui/inputs/service.js",
		"../ui/lib/pretty-bytes.js",
		"../ui/notification.js",
		"../ui/inputs/href.js",
		"../ui/inputs/crop.js",
		"../ui/form.js",
		"../ui/menu.js",
		"../ui/move.js",
		"../ui/breadcrumb.js",
		"../ui/store.js",
		"../ui/share.js",
		"../ui/lib/perfect-scrollbar.js",
		"../ui/lib/infinite-scroll.min.js",
		"../ui/setup.js",
		"/.pageboard/pagecut/menu.js",
		"../ui/lib/cropper.min.js",
		"../ui/lib/speakingurl.min.js"
	]
};

