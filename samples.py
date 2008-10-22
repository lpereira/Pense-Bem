#!/usr/bin/env python

def load():
	f = open('SAMPLES')
	# skip first line
	l = f.readline()

	for l in f.xreadlines():
		l = l.rstrip()
		if not l:
			continue

		bs,q,a = l.split()
		bs = int(bs)
		q = int(q)
		assert a in 'abcd'

		yield bs,q,a


if __name__ == '__main__':
	import sys
	book = int(sys.argv[1])
	question = int(sys.argv[2])
	for bs,q,a in load():
		if book == int(bs/10):
			if q == question:
				print a
				sys.exit(0)
	sys.exit(1)
