#!/usr/bin/python
"""gremlin_query_server.wsgi:
April 2014	chrisw

A WSGI tornado server for submitting Groovy-flavored Gremlin query scripts to Rexster.

"""
import query_gremlin

import sys
#import tornado.ioloop
#import tornado.web
import tornado.wsgi
import wsgiref.simple_server
#import tornado.autoreload
import datetime
from urllib2 import unquote
import json

portNumber = 80

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
# for WSGI in apache, the URL must match the WSGIScriptAlias in the VirtualHost tag of httpd.conf
#application = tornado.web.Application([
application = tornado.wsgi.WSGIApplication([
	(r"/gremlin", MainHandler),
	(r"/gremlin/static/(.*)", tornado.web.StaticFileHandler, {"path": r"static/"}),
	(r"/gremlin/query", BmegGremlinQueryHandler)
])

# start server
if __name__ == "__main__":
#    application.listen(sys.argv[1])
#    ioloop = tornado.ioloop.IOLoop.instance()
#    tornado.autoreload.start(ioloop)
#    ioloop.start()
	server = wsgiref.simple_server.make_server('', portNumber, application)
	server.serve_forever()
