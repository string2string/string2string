#!/usr/bin/env python
import string2string.string2string as s2s

client = s2s.Client('hackcooper.cloudapp.net')

client.eraseAll()

client.sendPoints([(1,1), (1000,1000)])