#!/usr/bin/env python

import samples

def answer(book,question):
	#print 'book', book
	#print 'question', question

	pattern_list = ["cddbaadcbdaadcbb",
		 "ccbdddbdababdaca",
		 "ddcbdababdacaccb",
		 "aabbcdcdddacaabc",
		 "ccabadbbbcdcddda", # Position [1] is just a hint. More info needed!
		 "adcbadbadbbddccb", # Position [1] is just a hint. More info needed!
		 "addbadbbdcccbadb", # Position [1] is just a hint. More info needed!
		 "ddbbdabbdabdabcc", # Position [1] is just a hint. More info needed!
		 "bddccddaacdbbddb", # Position [1] is just a hint. More info needed!
		 "cbcdcbbbdabdddcd"] # Position [1] is just a hint. More info needed!

	pattern_number = (question - 1) / 15 # For each 15 questions the pattern changes (1-15 != 16-30 != ...)
	question = (question % 15) if (question % 15) > 0 else 15 # Need question numbers ranging from 1 to 15

	#print 'pattern_number', pattern_number
	#print 'new_question', question
	#print 'calc_candidate', ((book+question)%16)

	pattern = pattern_list[pattern_number]

	return pattern[(book+question)%16]
	
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
