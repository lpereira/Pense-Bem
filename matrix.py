import sys

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
		sys.stdout.write(m.get( (bs,q), ' '))
	sys.stdout.write('\n')
