REPORTER = dot

all: deps

deps:
	sudo npm install

clear-cache:
	sudo rm -rf build dist *.log

clean:
	sudo rm -rf node_modules build dist *.log

test:
	./node_modules/.bin/mocha

.PHONY: all test deps clear-cache clean