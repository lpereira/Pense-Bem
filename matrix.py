#!/usr/bin/env python

import sys

# functions checking for known patterns:
# - will return -1 for "not applied"
#   0 for "match", > 0 for non-match

def check_shift(m, bs, q, a):

	# look for known answer on previous
	# questions:
	o = None
	while bs > 11 and q < 30:
		bs -= 10 # same section on previous book
		q += 1   # next question
		o = m.get( (bs, q) )
		if o:
			# found!
			break

	if not o:
		return -1

	if a == o:
		return 0
	else:
		return 1

# list of pattern-checking functions,
# and highlight escape code
checkers = [
	(check_shift,'1'),
]

m = {}
f = open('SAMPLES')

maxbook = 0

# skip first line
l = f.readline()
for l in f.xreadlines():
	l = l.rstrip()
	if not l: continue

	bs,q,a = l.split()
	bs = int(bs)
	q = int(q)
	m[bs,q] = a

	b = int(bs/10)
	if maxbook < b:
		maxbook = b

for b in range(1, maxbook+1):
	bs = b*10+1
	sys.stdout.write('%03d ' % (bs))
	for q in range(1,31):
		a = m.get( (bs,q), ' ')

		# check for known patterns
		if a != ' ':
			for function,color in checkers:
				r = function(m, bs, q, a)

				# doesn't match pattern?
				if r > 0:
					a = "\x1b[%sm%s\x1b[0m" % (color, a)
					break

		sys.stdout.write(a)
	sys.stdout.write('\n')
