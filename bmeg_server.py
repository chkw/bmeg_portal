#!/usr/bin/python
"""bmeg_server.py:
March 2014	chrisw

A tornado server for submitting Groovy-flavored Gremlin query scripts to Rexster.

"""
import BmegGremlinQueryHandler

import sys
import tornado.ioloop
import tornado.web
import tornado.autoreload

class MainHandler(tornado.web.RequestHandler):
    def get(self):
  		self.write("Hello, world.  This is the MainHandler.")

# map urls to handlers
application = tornado.web.Application([
	(r"/", MainHandler),
	(r"/static/(.*)", tornado.web.StaticFileHandler, {"path": r"static/"}),
	(r"/query", BmegGremlinQueryHandler.BmegGremlinQueryHandler)
])

# start server
if __name__ == "__main__":
    application.listen(sys.argv[1])
    ioloop = tornado.ioloop.IOLoop.instance()
    tornado.autoreload.start(ioloop)
    ioloop.start()
