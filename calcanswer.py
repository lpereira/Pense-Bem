
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

for l in f.xreadlines():
	l = l.rstrip()
	if not l:
		continue

	b,q,a = l.split()

	expected = answer(int(b), int(q))
	if expected:
		print b,q,expected
		assert a == expected
