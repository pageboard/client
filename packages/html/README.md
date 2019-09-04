# pageboard-elements

Elements can be defined in three parts:

- view, needed by pageboard-read to render blocks
- schema, needed by pageboard-write to edit attributes, and by pageboard-api to
  validate blocks
- edit, defines the specs of the rich text content and optionally a render
  function for edition.

It's up to pageboard-read and pageboard-write main files to load the files,
using either js files or html imports.

## everything in a single, requireable js file

Exports everything in a single file, accessible from
`public/elements/myname.js`

```
(function(exports) {
	exports.myname = {
		view: function(doc, block) {
			// do more than that of course
			return doc.createElement('div');
		},
		edit: function(doc, block) {
			// optional function
		},
		properties: {
			myprop: {
				type: 'string'
			}
		}
		specs: {
			mycontent: 'block+'
		}
	};
})(typeof exports != "undefined" ? exports : window.Pagecut.modules);
```


## multiple js files

Exports edit, view, schema from different files, accessible from
`public/elements/myname/view.js`
`public/elements/myname/edit.js`
`public/elements/myname/index.js` (defines the schema, must be requireable)

It is advised to test before assigning like this

```
(function(exports) {
	if (!exports.myname) exports.myname = {}; // test here
	exports.myname.properties = {
		myprop: {
			type: 'string'
		}
	};
})(typeof exports != "undefined" ? exports : window.Pagecut.modules);
```

view and edit files are not supposed to be requireable

```
(function(exports) {
	if (!exports.myname) exports.myname = {}; // test here
	exports.myname.view = function() {};//...
})(window.Pagecut.modules);
```


## multiple html imports

This layout is also supported:
`public/elements/myname/view.html`
`public/elements/myname/edit.html`
`public/elements/myname/index.js` (defines the schema, must be requireable)

Where view and edit load their assets as script (inline or not), link, or style
tags.



