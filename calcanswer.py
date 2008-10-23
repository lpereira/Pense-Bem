#!/usr/bin/env python

import samples

def answer(book,question):
	if question <= 15:
		pattern = "cddbaadcbdaadcbb"
		return pattern[(book+question)%16]
	
	return None


correct = 0
unknown = 0
errors = 0
m = samples.dict()
for b,q in m.keys():
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
