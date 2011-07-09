all: pensebem-min.js pensebem-min.svg index.html

pensebem-min.svg: pensebem.svg pensebem-realistic.svg deindent.py scour/scour.py
	scour/scour.py -i pensebem-realistic.svg -o pensebem-min-tmp.svg --create-groups --enable-comment-stripping --remove-metadata --no-renderer-workaround --strip-xml-prolog
	./deindent.py pensebem-min-tmp.svg > pensebem-min.svg
	sed -i -e 's/PB\.buttonPress/window.PB_buttonPress/g' pensebem-min.svg
	sed -i -e 's/PB\.init/window.PB_init/g' pensebem-min.svg
	sed -i -e 's/<script[^>]*>//g' pensebem-min.svg
	rm -f pensebem-min-tmp.svg 

index.html: pensebem-min.svg index.html.in
	cpp index.html.in | grep -v '^#' | grep -v '^$$' > index.html
	cp index.html html-output

pensebem-min.js: pensebem.js
	java -jar closure/compiler.jar --accept_const_keyword --compilation_level ADVANCED_OPTIMIZATIONS < pensebem.js > pensebem-min.js
	cp pensebem-min.js html-output

clean:
	rm -rf pensebem-min.svg html-output/index.html html-output/pensebem-min.js index.html pensebem-min.js



