BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")') -t [ babelify --presets [ es2015 ] ]

FONT_DIR      ?= ./font
FONTELLO_HOST ?= http://fontello.com

.PHONY: build
build: predist dist/menu.js dist/editor.js dist/viewer.js

.PHONY: all

all: clean build

clean:
	rm -rf dist/*

ts:
	./node_modules/.bin/tsc --allowJs --checkJs --noEmit --lib es2015,dom src/editor.js

predist:
	mkdir -p dist/
	cp -f src/*.css dist/

dist/editor.js: src/*.js
	-patch --backup --forward --strip 0 --quiet --reject-file - < patches/prosemirror-view-pr-40.patch
	-patch --backup --forward --strip 0 --quiet --reject-file - < patches/prosemirror-model-pr-39.patch
	-patch --backup --forward --strip 0 --quiet --reject-file - < patches/prosemirror-view-css-checked.patch
	$(BROWSERIFY) --standalone Pagecut --outfile $@ src/editor.js

dist/viewer.js: src/*.js
	$(BROWSERIFY) --standalone Pagecut.Viewer --outfile $@ src/viewer.js

dist/menu.js: src/menubar.js
	$(BROWSERIFY) --standalone Pagecut.Menubar --outfile $@ src/menubar.js

