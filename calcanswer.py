#!/usr/bin/env python

def answer(b,q):
	book = int(b/10)
	sec = b % 10
	question = (sec-1)*30 + q
	if question == 1:
		pattern = "ddbaadcbdaadcbbc"
		return pattern[book%16]
	
	return None


f = open('SAMPLES')

# skip first line
l = f.readline()

correct = 0
unknown = 0
errors = 0
for l in f.xreadlines():
	l = l.rstrip()
	if not l:
		continue

	b,q,a = l.split()

	expected = answer(int(b), int(q))
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
	print "%d errors. :("
