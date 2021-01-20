#!/usr/bin/env python

import samples

def answer(book,question):
	pattern_list = [
		 "cddbaadcbdaadcbb",
		 "ccbdddbdababdaca",
		 "ddcbdababdacaccb",
		 "aabbcdcdddacaabc",
		 "ccabadbbbcdcddda", # Position [1] is just a hint. More info needed!
		 "adcbadbadbbddccb", # Position [1] is just a hint. More info needed!
		 "addbadbbdcccbadb", # Position [1] is just a hint. More info needed!
		 "ddbbdabbdabdabcc", # Position [1] is just a hint. More info needed!
		 "bddccddaacdbbddb", # Position [1] is just a hint. More info needed!
		 "cbcdcbbbdabdddcd"  # Position [1] is just a hint. More info needed!
	]
	pattern_number = int((question - 1) / 15) # For each 15 questions the pattern changes (1-15 != 16-30 != ...)
	question = (question % 15) if (question % 15) > 0 else 15 # Need question numbers ranging from 1 to 15

	pattern = pattern_list[pattern_number]

	return pattern[(book+question)%16]
	
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
			print(f"ERROR: book {b}, question {q}: {a} should be {expected}.")
			errors += 1
	else:
		unknown += 1

print(f"Correct answers: {correct}. Unknown answers: {unknown}")
if errors:
	print("%d ERRORS. :(" % (errors))
