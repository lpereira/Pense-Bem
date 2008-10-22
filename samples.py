
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
