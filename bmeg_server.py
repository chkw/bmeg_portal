#!/usr/bin/python

import sys
import tornado.ioloop
import tornado.web

class MainHandler(tornado.web.RequestHandler):
    def get(self):
		self.write("Hello, world.  This is the MainHandler.")

application = tornado.web.Application([
	(r"/", MainHandler),
	(r"/static/(.*)", tornado.web.StaticFileHandler, {"path": r"static/"}),
])

if __name__ == "__main__":
    application.listen(sys.argv[2])
    tornado.ioloop.IOLoop.instance().start()
