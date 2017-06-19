
BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

prepublish: write/lib/throttle.js write/lib/pretty-bytes.js

write/lib/throttle.js: node_modules/throttleit/index.js
	$(BROWSERIFY) --standalone Throttle --outfile $@ $<

write/lib/pretty-bytes.js: node_modules/pretty-bytes/index.js
	$(BROWSERIFY) --standalone PrettyBytes --outfile $@ $<

