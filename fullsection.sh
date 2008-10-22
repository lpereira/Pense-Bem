#!/bin/sh

book="$1"
sec="$2"
starts="$3"
if [ -z "$sec" ];then
	sec="1"
fi

bs="${book}${sec}"

echo BOOK: $bs
if [ -z "$starts" ];then
	case "$sec" in
		1)
			starts=1
		;;
		*)
			read -p "Starts on question (r for random): " starts
		;;
	esac
fi

get_question()
{
	local q="$1"
	local known="$(./samples.py "$book" "$q")"
	local prompt
	if [ -z "$known" ];then
		prompt="$q: "
	else
		prompt="$q (I know: it's $known): "
	fi
	read -p "$prompt" a
	echo -e "$bs\t$q\t$a" >> SAMPLES
}

if [ "$starts" = "r" ];then
	while :;do
		if ! read -p "Question: " q;then
			break
		fi
		if [ -z "$q" ];then
			break
		fi
		get_question "$q"
	done
else
	for q in `seq $starts $[starts+30]`;do
		get_question "$q"
	done
fi
