import urllib.parse
import http.client
import math
import serial
import os

######## CLIENT CLASS ###########

class Client:
	'string2string client class'

	def __init__(self, address):
		self.address = address
		self.d_short = (0, 0)
		self.d_long = (0, 0)
		self.dx = 0
		self.page = '/chalkboard'
		serial_folder = '/dev/serial/by-id/'
		serial_location = serial_folder + os.listdir(serial_folder)[0]
		self.ser = serial.Serial(serial_location, 115200)

	def eraseAll(self):
		# HTTP POST
		self.post('E')

	def sendPoints(self,points):
		# points must be a list of point pairs
		points_string = 'P~'
		for point in points:
			points_string = points_string + str(point[0]) + ',' + str(point[1]) + ','

		# remove comma
		points_string = points_string[0:-1]

		# HTTP POST
		self.post(points_string)

	def post(self,query):

		#data = {'query': query, 'id': 'string2string'}
		connection = http.client.HTTPConnection(self.address)
		url = self.page + '?query=' + query + '&id=string2string'
		connection.request('POST', url)
		response = connection.getresponse()
		print(response.status, response.reason)

	def d2p(self,d):
		r0 = d[0] - self.d_short[0]
		r1 = d[1] - self.d_short[1]
		r = (r0, r1)

		# Catch trig exceptions and try other angle
		try:
			t1 = math.acos( (self.dx*self.dx + r[1]*r[1] - r[0]*r[0])/(2*self.dx*r[1]) )
		except ValueError:
			try:
				t1 = math.acos( (self.dx*self.dx + r[0]*r[0] - r[1]*r[1])/(2*self.dx*r[0]) )
			except ValueError:
				return 'E'

		try:
			t2 = math.acos( (self.dx*self.dx + r[0]*r[0] - r[1]*r[1])/(2*self.dx*r[0]) )
		except ValueError:
			try: 
				t2 = math.acos( (self.dx*self.dx + r[1]*r[1] - r[0]*r[0])/(2*self.dx*r[1]) )
			except ValueError:
				return 'E'

		x1 = self.dx - r[1] * math.cos(t1)
		x2 = r[0] * math.cos(t2)

		y1 = r[1] * math.sin(t1)
		y2 = r[0] * math.sin(t2)

		x = (x1 + x2)/2
		y = (y1 + y2)/2

		p = (x, y)
		return p

	def serialRead(self):
		byte = ''
		while byte is not '~':
			byte = self.ser.read(1).decode("utf-8")
			if byte == 'P':
				return byte
			if byte == 'R':
				return byte

		coord_string = ''
		while byte is not '\r':
			byte = self.ser.read(1).decode("utf-8")
			if byte == 'P':
				return byte
			if byte == 'R':
				return byte
			coord_string = coord_string + byte

		coord_string = coord_string.split(',')
		coord = (int(coord_string[0]), int(coord_string[1]))
		if coord[0] == 0 or coord[1] == 0:
			return 'E'
		return coord
		
	def calibrate(self):
		# Left Calibrate
		print('Calibrate left')
		serial_data = ''
		while serial_data is not 'P':
			serial_data = self.serialRead()
		points = []
		while 1:
			serial_data = self.serialRead()
			if serial_data is 'R':
				break
			if serial_data is 'E':
				continue
			points.append(serial_data)
		summed = sumTuple(points)
		self.d_short = (summed[0]/len(points), self.d_short[1])
		self.d_long = (self.d_long[0], summed[1]/len(points))

		# Right Calibrate
		print('Calibrate right')
		serial_data = ''
		while serial_data is not 'P':
			serial_data = self.serialRead()
		points = []
		while 1:
			serial_data = self.serialRead()
			if serial_data is 'R':
				break
			if serial_data is 'E':
				continue
			points.append(serial_data)
		summed = sumTuple(points)

		self.d_short = (self.d_short[0], summed[1]/len(points))
		self.d_long = (summed[0]/len(points), self.d_long[0])
		self.dx = ((self.d_long[0] - self.d_short[0]) + (self.d_long[1] - self.d_short[1]))/2

	def run(self):
		while 1:
			packet = []
			while len(packet) < 10:
				d = self.serialRead()
				if type(d) is tuple:
					p = self.d2p(d)
					if type(p) is tuple:
						packet.append(p)
				if d == 'R':
					break
			self.sendPoints(packet)

####### FUNCTIONS ##########

def sumTuple(tuple):
	return [sum(x) for x in zip(*tuple)]