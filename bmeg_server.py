#!/usr/bin/python
"""bmeg_server.py:
March 2014	chrisw

A tornado server for submitting Gremlin query scripts to Rexster.

Requests should have a query parameter, "script", whose value is a Groovy flavored Gremlin script.

"""
import query_gremlin

import sys
import tornado.ioloop
import tornado.web
import tornado.autoreload
import datetime
import json
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

class MainHandler(tornado.web.RequestHandler):
    def get(self):
#  		self.write("Hello, world.  This is the MainHandler.")
 		self.write(query_gremlin.test() + " from MainHandler")

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
			else:
				self.write({"success":False})
		# default response
		else:
			self.write({"success":False})

# map urls to handlers
application = tornado.web.Application([
	(r"/", MainHandler),
	(r"/static/(.*)", tornado.web.StaticFileHandler, {"path": r"static/"}),
	(r"/query", BmegGremlinQueryHandler)
])

# start server
if __name__ == "__main__":
    application.listen(sys.argv[1])
    ioloop = tornado.ioloop.IOLoop.instance()
    tornado.autoreload.start(ioloop)
    ioloop.start()
