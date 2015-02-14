import urllib.parse
import http.client
import math
import serial

class Client:
	'string2string client class'

	

	def __init__(self, address):
		self.address = address
		self.d_short = (0, 0)
		self.d_long = (0, 0)
		self.dx = 0
		self.page = '/chalkboard'
		#self.ser = serial.Serial('/dev/tty.usbserial', 9600)

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

	def d2p(d):
		r = (0, 0)
		r[0] = d[0] - d_short[0]
		r[1] = d[1] - d_short[1]
		t1 = math.acos( (self.dx*self.dx + r[1]*r[1] - r[0]*r[0])/(2*self.dx*r[1]) )
		t2 = math.acos( (self.dx*self.dx + r[0]*r[0] - r[1]*r[1])/(2*self.dx*r[0]) )

		x1 = self.dx - r[1] * math.cos(t1)
		x2 = r[0] * math.cos(t2)

		y1 = r[1] * math.sin(t1)
		y2 = r[0] * math.sin(t2)

		x = (x1 + x2)/2
		y = (y1 + y2)/2

		p = (x, y)
		return p
