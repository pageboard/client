BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

semanticui := $(shell node -p "require('path').dirname(require.resolve('semantic-ui-css'))")
scrollbar := $(shell node -p "require('path').dirname(require.resolve('perfect-scrollbar'))")
moment := $(shell node -p "require('path').dirname(require.resolve('moment'))")
esequal := $(shell node -p "require('path').dirname(require.resolve('esequal'))")
jquery := $(shell node -p "require('path').dirname(require.resolve('jquery'))")

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
	ln -sf ${esequal}/esequal.js write/lib/

write/lib/throttle.js: node_modules/throttleit/index.js
	$(BROWSERIFY) --standalone Throttle --outfile $@ $<

write/lib/pretty-bytes.js: node_modules/pretty-bytes/index.js
	$(BROWSERIFY) --standalone PrettyBytes --outfile $@ $<

write/lib:
	mkdir -p $@

