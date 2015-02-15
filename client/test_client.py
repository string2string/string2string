#!/usr/bin/env python
import string2string.string2string as s2s
import time

client = s2s.Client('hackcooper.cloudapp.net')

client.eraseAll()

client.calibrate()

client.run()