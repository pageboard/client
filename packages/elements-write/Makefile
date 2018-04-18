BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

prettybytes := $(shell node -p "require('path').dirname(require.resolve('pretty-bytes'))")

build: write/lib write/lib/pretty-bytes.js

write/lib/pretty-bytes.js: ${prettybytes}/index.js
	$(BROWSERIFY) --standalone Pageboard.PrettyBytes --outfile $@ $<

write/lib:
	mkdir -p $@

