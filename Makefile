all: run

build: clear-cache
	grunt

deps:
	sudo npm install

run: build
	npm start

clear-cache:
	rm -rf build dist *.log

clean:
	sudo rm -rf node_modules build dist *.log

test:
	./node_modules/.bin/mocha

.PHONY: all test build deps run clear-cache clean