#!/usr/bin/env python

import samples

def answer(book,question):
	pattern_list = ["cddbaadcbdaadcbb",
		 "ccbdddbdababdaca",
		 "ddcbdababdacaccb",
		 "aabbcdcdddacaabc",
		 "cXabadbbbcdcddda", # Position [1] is unknown. More info needed!
		 "aXcbadbadbbddccb", # Position [1] is unknown. More info needed!
		 "aXdbadbbdcccbadb", # Position [1] is unknown. More info needed!
		 "dXbbdabbdabdabcc", # Position [1] is unknown. More info needed!
		 "bXdccddaacdbbddb", # Position [1] is unknown. More info needed!
		 "cXcdcbbbdabdddcd"] # Position [1] is unknown. More info needed!

	pattern_number = (question - 1) / 15 # For each 15 questions the pattern changes (1-15 != 16-30 != ...)
	question = (question % 15) if (question % 15) > 0 else 15 # Need question numbers ranging from 1 to 15

	pattern = pattern_list[pattern_number]
	candidate = pattern[(book+question)%16]

	return candidate if candidate != "X" else None
	
correct = 0
unknown = 0
errors = 0
m = samples.dict()
for b,q in m.keys():
	print 'book', b
	a = m[b,q]
	expected = answer(b, q)
	if expected:
		if a == expected:
			correct += 1
		else:
			print "ERROR: b%d, q%d. collected sample: %s. calculated answer: %s" % (b, q, a, expected)
			errors += 1
	else:
		unknown += 1

print "Correct answers: %d. Unknown answers: %d" % (correct, unknown)
if errors:
	print "%d ERRORS. :(" % (errors)
