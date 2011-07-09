#!/usr/bin/python

from xml.dom.minidom import parse
from sys import argv

document = parse(argv[1])
print document.toxml().replace('\n', '').replace('<?xml version="1.0" ?>', "").encode("utf-8")
