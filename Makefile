build:
	rm -rf dist || true
	node_modules/.bin/tsc -p tsconfig.json
	node_modules/.bin/tsc -p tsconfig.test.json
	chmod +x dist/bin.js
	node dist/utils/packStdLib.js

GREP="."

just-test:
	node ./node_modules/mocha/bin/_mocha --require source-map-support/register --grep "$(GREP)" --timeout 10000 test/*.spec.js

test: | build just-test

ci-test: | lint test e2e

inspect: build
	node --inspect ./node_modules/mocha/bin/_mocha --require source-map-support/register test/*.spec.js

watch: build
	node_modules/.bin/tsc -p tsconfig.json --watch & node_modules/.bin/tsc -p tsconfig.test.json --watch

lint:
	node_modules/.bin/tslint src/**/*.ts --project tsconfig.json

e2e:
	cd test/fixtures/cli/smoke && ../../../../dist/bin.js main.lys --test --debug --wast
	cd test/fixtures/cli/custom-lib && ../../../../dist/bin.js main.lys --test --debug --wast --lib lib.js
	$(MAKE) md-tests

md-tests:
	node test/RunModulesFolder.js

snapshot: export UPDATE_AST=true
snapshot: just-test

.PHONY: build test snapshot
