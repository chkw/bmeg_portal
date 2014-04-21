"""BmegGremlinQueryHandler.py:
April 2014	chrisw

A tornado.web.RequestHandler for handling requests for BMEG query results.

"""
import query_gremlin

import sys
import datetime
import json
import tornado.web
import urllib2

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

# test with: http://localhost:9886/query?script=g.V("name","tcga_attr:FEMALE").in().count()
class BmegGremlinQueryHandler(tornado.web.RequestHandler):
	def get(self):
		params = getQueryParams(self.request.uri)
		# run gremlin script directly from URL query string
		if ("script" in params):
			response = query_gremlin.query_bmeg(params["script"])
			self.write(response)
		# use URL query string params to build/submit gremlin query
		elif ("queryObject" in params):
			queryObject = json.loads(urlDecode(params["queryObject"]))
			if (not "method" in queryObject):
				self.write({"success":False})
				return
			if (queryObject["method"] == "getAllPatients"):
				response = query_gremlin.getAllPatients()
				self.write(response)
			elif (queryObject["method"] == "queryGender"):
				response = query_gremlin.queryGender()
				self.write(response)
			elif (queryObject["method"] == "queryDiseaseCode"):
				response = query_gremlin.queryDiseaseCode()
				self.write(response)
			elif (queryObject["method"] == "queryMutationStatus"):
				bmegQueryParams = queryObject["params"]
				response = query_gremlin.queryMutationStatus(bmegQueryParams['hugoIdList'])
				self.write(response)
			else:
				self.write({"success":False})
		# default response
		else:
			self.write({"success":False})
