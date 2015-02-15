#!/usr/bin/env python
import string2string.string2string as s2s

client = s2s.Client('hackcooper.cloudapp.net')

while 1:
	print(client.serialRead())