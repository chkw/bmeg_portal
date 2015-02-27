"""BmegSigDbQueryHandler.py:
Feb 2015	chrisw

A tornado.web.RequestHandler for handling requests for BMEG signature db service query results.

"""

import sys
import datetime
import ConfigParser
import json
import tornado.web
# import urllib
import urllib2

# import os, base64

config = ConfigParser.ConfigParser({'host':'localhost', 'port':'8080'})
config.read('bmeg.cfg')
bmegSigServerUrl = "http://" + config.get('bmegSigServer', 'host') + ":" + config.get('bmegSigServer', 'port') + "/" + config.get('bmegSigServer', 'file')
# sys.stderr.write('bmegSigServerUrl is %s' % (bmegSigServerUrl))

def getTime():
	now = datetime.datetime.now()
	return now

def prettyJson(object):
 	jo = (json.loads(object) if (isinstance(object, basestring)) else object)
	s = json.dumps(jo, sort_keys=True, indent=4, separators=(',', ': '))
	return s

def urlDecode(encodedString):
	decodedString = urllib2.unquote(encodedString.encode("utf8"))
	return decodedString

def getQueryParams(uri):
	params = dict()
	strings = uri.split("?", 1)
	if (len(strings) < 2):
		return params
	for pairs in strings[1].split("&"):
		strings = pairs.split("=", 1)
		params[strings[0]] = strings[1]
	return params

# test with: http://localhost:9886/sigQuery?queryObject={%22querySet%22:[%22TP53%22,%22RB1%22,%22PLK1%22,%22MYO1B%22]}
class BmegSigDbQueryHandler(tornado.web.RequestHandler):
	def get(self):
		
		params = getQueryParams(self.request.uri)
		# 
		if ("queryObject" in params):
			stringifiedJson = urlDecode(params["queryObject"])
 			queryObject = json.loads(stringifiedJson)
 			
 			# bmeg sig server requires dictionary of gene:weight
 			querySet = queryObject['querySet']
 			weightsObj = {}
 			for gene in querySet:
 				weightsObj[gene] = 1.0
			
# 			s = '{"limit":3, "weights" : {"ITCH":0.5,"PLK1":0.6,"MYO1B":0.3}}'
			s = '{"weights":%s}' % (json.dumps(weightsObj))
			
# 			sys.stderr.write('s:%s\n' % (s))

# 			data = urllib.urlencode(s)
			data = s
			url = bmegSigServerUrl

			try:
			    resp = urllib2.urlopen(url, data)
			    contents = resp.read()
			except urllib2.HTTPError, error:
			    contents = error.read()
			finally:
			    self.write(contents)

		# default response
		else:
			self.write({"success":False, "message":"no query object for BmegSigDbQueryHandler"})
