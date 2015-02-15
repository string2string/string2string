#!/usr/bin/env python
import string2string.string2string as s2s

client = s2s.Client('string2string.mybluemix.net')

client.eraseAll()

client.calibrate()

client.run()