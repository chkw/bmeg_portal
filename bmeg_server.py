#!/usr/bin/python

import sys
import tornado.ioloop
import tornado.web
import tornado.autoreload
import datetime
import urllib2
import json

def getTime():
	now = datetime.datetime.now()
	return now

def prettyJson(serializedJson):
	jo = json.loads(serializedJson)
	s = json.dumps(jo, sort_keys=True, indent=4, separators=(',', ': '))
	return s

def queryBmeg():
	# http://localhost:8182/graphs/graph/
	url = "http://localhost:8182/graphs/graph"
	response = urllib2.urlopen(url).read()
	sys.stderr.write("response\t"+ prettyJson(response) + "\n")
	return prettyJson(response)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
		self.write("Hello, world.  This is the MainHandler.")

class BmegGremlinQueryHandler(tornado.web.RequestHandler):
	def get(self):
		self.write("This is the BmegGremlinQueryHandler.\n")
		response = queryBmeg()
		sys.stderr.write(str(getTime()) + "\t" + "" + response +"\n")
		self.write(str(getTime()) + "\t" + "" + response +"\n")

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
