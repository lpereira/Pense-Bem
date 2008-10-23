#!/usr/bin/env python

import samples

def answer(b,q):
	book = int(b/10)
	sec = b % 10
	question = (sec-1)*30 + q
	if question <= 15:
		pattern = "cddbaadcbdaadcbb"
		return pattern[(book+question)%16]
	
	return None


correct = 0
unknown = 0
errors = 0
for b,q,a in samples.load():
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
