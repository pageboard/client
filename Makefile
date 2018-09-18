
nodeModules := node_modules/@pageboard
modules := $(wildcard ./modules/*)
links := $(patsubst ./modules/%,$(nodeModules)/%,$(modules))

all: $(nodeModules) $(links) install

$(nodeModules):
	mkdir -p $@

$(nodeModules)/%: modules/%
	ln -s ../../$< $@

clean:
	rm $(nodeModules)/*

install:
	# Do not forget to run prepare on development modules
	npm install --prod
	for mod in $(links); do cd $$mod; npm run postinstall; cd ../../..; done

