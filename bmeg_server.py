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

def getTime():
	now = datetime.datetime.now()
	return now

def prettyJson(object):
 	jo = (json.loads(object) if (isinstance(object, basestring)) else object)
	s = json.dumps(jo, sort_keys=True, indent=4, separators=(',', ': '))
	return s

class MainHandler(tornado.web.RequestHandler):
    def get(self):
		self.write("Hello, world.  This is the MainHandler.")

# use https://github.com/tinkerpop/rexster/wiki/Basic-REST-API to query the graph
def queryBmeg():
	# http://localhost:8182/graphs/graph/
	baseUrl = "http://localhost:8182"
# 	query = "/graphs/graph/vertices?key=type&value=tcga_attr:Patient"
	query = "/graphs/graph/vertices/348464/outE?_label=tcga_attr:gender/in"
	url = baseUrl + query
	response = urllib2.urlopen(url).read()
	sys.stderr.write("response\t" + prettyJson(response) + "\n")
	return prettyJson(response)

class BmegGremlinQueryHandler(tornado.web.RequestHandler):
	def get(self):
		self.write("This is the BmegGremlinQueryHandler.<hr>")
		response = queryBmeg()
		sys.stderr.write(str(getTime()) + "\t" + "" + response + "\n")
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
			sys.stderr.write("id " + str(results.get_id()) + "\n")

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
