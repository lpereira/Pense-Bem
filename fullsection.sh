#!/bin/sh

book="$1"
sec="$2"
if [ -z "$sec" ];then
	sec="1"
fi

bs="${book}${sec}"

echo BOOK: $bs
case "$sec" in
	1)
		starts=1
	;;
	*)
		read -p "Starts on question: " starts
	;;
esac

for q in `seq $starts $[starts+30]`;do
	read -p "$q: " a
	echo -e "$bs\t$q\t$a" >> SAMPLES
done
