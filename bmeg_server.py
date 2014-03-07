#!/usr/bin/python

import sys
import tornado.ioloop
import tornado.web
import tornado.autoreload
import datetime
import urllib2
import json
# from bulbs.config import Config, DEBUG
# from bulbs.rexster import RexsterClient
import bulbs.config
import bulbs.rexster

global rexsterURL
global bmegURL

rexsterURL = "http://localhost:8182"
bmegURL = rexsterURL + "/graphs/graph"

def getTime():
	now = datetime.datetime.now()
	return now

def prettyJson(object):
 	jo = (json.loads(object) if (isinstance(object, basestring)) else object)
	s = json.dumps(jo, sort_keys=True, indent=4, separators=(',', ': '))
	return s

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
		self.write("Hello, world.  This is the MainHandler.")

# use https://github.com/tinkerpop/rexster/wiki/Basic-REST-API to query the graph
def queryBmeg():
# 	url = bmegURL + "/vertices?key=type&value=tcga_attr:Patient"
	url = bmegURL + "/vertices/348464/outE?_label=tcga_attr:gender"
	response = urllib2.urlopen(url).read()
	sys.stderr.write("response\t" + prettyJson(response) + "\n")
	return prettyJson(response)

class BmegGremlinQueryHandler(tornado.web.RequestHandler):
	def get(self):
		params = getQueryParams(self.request.uri)
		sys.stderr.write(str(params) + "\n")
		self.write("This is the BmegGremlinQueryHandler.<hr>")
		self.write("uri: %s<hr>" % (self.request.uri))
		response = queryBmeg()
		self.write(str(getTime()) + "<hr>")
		self.write(response + "<hr>")

def queryBmeg_2():
	config = bulbs.config.Config("http://localhost:8182/graphs/graph")
	config.set_logger(bulbs.config.DEBUG)
	client = bulbs.rexster.client.RexsterClient(config)
# 	script = client.scripts.get(r"g.v(348464)")
# 	rexster_response = client.gremlin(script, params=None)
	rexster_response = client.get_vertex(348464)
	rexster_results = rexster_response.get_results()
	return rexster_results

class BmegGremlinQueryHandler2(tornado.web.RequestHandler):
	def get(self):
		self.write("This is the BmegGremlinQueryHandler2.<hr>")
		rexster_results = queryBmeg_2()
		for results in rexster_results:
			if (isinstance(results, bulbs.rexster.client.RexsterResult)):
				results_jo = results.get_data()
				sys.stderr.write("id " + prettyJson(results_jo) + "\n")

# map urls to handlers
application = tornado.web.Application([
	(r"/", MainHandler),
	(r"/static/(.*)", tornado.web.StaticFileHandler, {"path": r"static/"}),
	(r"/query", BmegGremlinQueryHandler),
	(r"/query2", BmegGremlinQueryHandler2)
])

# start server
if __name__ == "__main__":
    application.listen(sys.argv[1])
    ioloop = tornado.ioloop.IOLoop.instance()
    tornado.autoreload.start(ioloop)
    ioloop.start()
