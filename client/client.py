#!/usr/bin/env python
import string2string.string2string as s2s

#EDIT THE FOLLOWING LINE
client = s2s.Client('string2string.mybluemix.net')
#client = s2s.Client('hackcooper.cloudapp.net')

client.eraseAll()

client.calibrate()

client.run()