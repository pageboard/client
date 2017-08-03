BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

semanticui := $(shell node -p "require('path').dirname(require.resolve('semantic-ui-css'))")
scrollbar := $(shell node -p "require('path').dirname(require.resolve('perfect-scrollbar'))")
moment := $(shell node -p "require('path').dirname(require.resolve('moment'))")
jquery := $(shell node -p "require('path').dirname(require.resolve('jquery'))")
throttleit := $(shell node -p "require('path').dirname(require.resolve('throttleit'))")
prettybytes := $(shell node -p "require('path').dirname(require.resolve('pretty-bytes'))")

install: write/lib write/lib/pretty-bytes.js write/lib/throttle.js
	mkdir -p semantic-ui
	ln -sf ${semanticui}/components semantic-ui/
	ln -sf ${semanticui}/themes semantic-ui/

	mkdir -p write/lib
	ln -sf ${scrollbar}/dist/css/perfect-scrollbar.css write/lib/
	ln -sf ${scrollbar}/dist/js/perfect-scrollbar.js write/lib/

	ln -sf ${moment}/moment.js write/lib/
	ln -sf ${moment}/locale write/lib/moment-locales
	ln -sf ${jquery}/jquery.js write/lib/

write/lib/throttle.js: ${throttleit}/index.js
	$(BROWSERIFY) --standalone Throttle --outfile $@ $<

write/lib/pretty-bytes.js: ${prettybytes}/index.js
	$(BROWSERIFY) --standalone PrettyBytes --outfile $@ $<

write/lib:
	mkdir -p $@

