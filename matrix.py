#!/usr/bin/env python

import sys
import samples

# functions checking for known patterns:
# - will return -1 for "not applied"
#   0 for "match", > 0 for non-match

def check_shift(m, book, q, a):

	# look for known answer on previous
	# questions:
	o = None
	while book > 1:
		book -= 1 # same section on previous book
		q += 1    # next question
		o = m.get( (book, q) )
		if o:
			# found!
			break

	if not o:
		return -1

	if a == o:
		return 0
	else:
		return 1

def check_16(m, book, q, a):
	"""Check if it is similar to the 16th book before it"""
	o = m.get( (book-16, q) )
	if not o:
		return -1

	if a == o:
		return 0
	else:
		return 1

# list of pattern-checking functions,
# and highlight escape code
checkers = [
	(check_shift,'32'),
	(check_16,'31'),
]

m = {}
maxbook = 0
maxquestiosn = 0

m = samples.dict()
for book,q in m.keys():
	if maxbook < book:
		maxbook = book
	if q > maxquestiosn:
		maxquestiosn = q

for b in range(1, maxbook+1):
	sys.stdout.write('%02d ' % (b))
	for q in range(1,maxquestiosn+1):
		a = m.get( (b,q), ' ')

		# check for known patterns
		if a != ' ':
			for function,color in checkers:
				r = function(m, b, q, a)

				# doesn't match pattern?
				if r > 0:
					a = "\x1b[%sm%s\x1b[0m" % (color, a)
					break

		sys.stdout.write(a)
		if (q % 15) == 0:
			sys.stdout.write(' ')
	sys.stdout.write('\n')
