#!/bin/sh
book="${1}1"
echo BOOK: $book
for q in `seq 1 30`;do
	read -p "$q: " a
	echo -e "$book\t$q\t$a" >> SAMPLES
done
