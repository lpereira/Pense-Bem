#!/usr/bin/env python

def read():
	"""Read sequence of samples

	Use if you want to get the list of samples as-is, maybe with duplicated
	"""
	f = open('SAMPLES')
	# skip first line
	l = f.readline()

	for l in f.readlines():
		l = l.rstrip()
		if not l:
			continue

		bs,q,a = l.split()
		bs = int(bs)
		q = int(q)
		assert a in 'abcd'

		yield bs,q,a

def dict():
	"""Load samples as a (book, question) -> answer dictionary

	Sections (3rd digit of booksection) are ignored, as they are not relevant
	to define the answer.

	Use if you don't want to get duplicates.
	"""
	m = {}
	samples = list(open('SAMPLES').read())
	for book in range(99):
		for q in range(150):
			a = samples.pop(0)
			m[(book+1, q+1)] = a
	return m

if __name__ == '__main__':
	import sys
	book = int(sys.argv[1])
	question = int(sys.argv[2])
	for bs,q,a in read():
		if book == int(bs/10):
			if q == question:
				print(a)
				sys.exit(0)
	sys.exit(1)
