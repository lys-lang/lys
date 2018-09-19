build:
	npm run build

test: build
	npm run test

snapshot: export UPDATE_AST=true
snapshot: test

.PHONY: build test snapshot
