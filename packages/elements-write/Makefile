BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

debounce := $(shell node -p "require('path').dirname(require.resolve('debounce'))")
prettybytes := $(shell node -p "require('path').dirname(require.resolve('pretty-bytes'))")

build: write/lib write/lib/pretty-bytes.js write/lib/debounce.js

write/lib/debounce.js: ${debounce}/index.js
	$(BROWSERIFY) --standalone Pageboard.Debounce --outfile $@ $<

write/lib/pretty-bytes.js: ${prettybytes}/index.js
	$(BROWSERIFY) --standalone Pageboard.PrettyBytes --outfile $@ $<

write/lib:
	mkdir -p $@

