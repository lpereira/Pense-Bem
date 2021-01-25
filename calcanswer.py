#!/usr/bin/env python

import samples

answers = []

def precalc():
	global answers
	for b in range(99):
		answers.append([])

	pattern1 = list("dbaadcbdaadcbbc"
                        "bdddbdababdacac"
                        "cbdababdacaccbd"
                        "bbcdcdddacaabca"
                        "abadbbbcdcdddac"
                        "cbadbadbbddccba"
                        "dbadbbdcccbadba"
                        "bbdabbdabdabccd"
                        "dccddaacdbbddbb"
                        "cdcbbbdabdddcdc")

	pattern2 = list("22221202301023123110332032313302"
                        "03022121320233203323333220221221"
                        "30303330010113102300312222030031"
                        "22201303322312111332102302332023"
                        "12033033201101201022100330112212"
                        "31101032132131211313212111330313"
                        "23120203032010023131303302312120"
                        "03233301131332001130130102322321"
                        "00101020113320201200223033300200"
                        "20332303233320232301303322112030"
                        "33000131223323032222211303211222"
                        "01022012130321201023122111120300"
                        "31213021320123211301301322230130"
                        "22030130333312012220221103001133"
                        "10031131131230212010110223103300"
                        "32322123132020333001212020032303"
                        "10302221221023033011310303012012"
                        "12012031321213323020123321303210"
                        "013020120331")

	for b in range(99):
		if b == 0:
			for q in range(150):
				answers[0].append(pattern1[q])
			continue

		first = pattern1[0]
		for q in range(150):
			v = 0
			if q%30 == 14 or q==149:
				v = pattern2.pop(0)

			if q==149:
				prev = first
			else:
				prev = pattern1[q+1]

			pattern1[q] = chr(ord('a') + (ord(prev) - ord('a') + int(v)) % 4)

		for q in range(150):
			answers[b].append(pattern1[q])

def answer(book, question):
#	global answers
	return answers[book-1][question-1]

precalc()
	
import sys
correct = 0
errors = 0
m = samples.dict()
for b,q in m.keys():
	expected = m[b,q]
	calculated = answer(b, q)

	if calculated == expected:
		correct += 1
	else:
		print(f"ERROR: book {b}, question {q}: Miscalculated as {calculated}. Should be {expected}.")
		sys.exit(-1)
		errors += 1

print(f"Correct answers: {correct} out of {99*150} [{100.0 * correct / (99*150):.01f}%].")
if errors:
	print("%d ERRORS. :(" % (errors))
