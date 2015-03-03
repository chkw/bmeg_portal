#!/usr/bin/python
"""gremlin_query_server.wsgi:
April 2014	chrisw

A WSGI tornado server for submitting Groovy-flavored Gremlin query scripts to Rexster.

"""
import BmegGremlinQueryHandler
import BmegSigDbQueryHandler

import sys
import tornado.wsgi
import wsgiref.simple_server


class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.write("This message is from MainHandler.")

# map urls to handlers
# for WSGI in apache, the URL must match the WSGIScriptAlias in the VirtualHost tag of httpd.conf
#application = tornado.web.Application([
application = tornado.wsgi.WSGIApplication([
	(r"/gremlin", MainHandler),
	(r"/gremlin/static/(.*)", tornado.web.StaticFileHandler, {"path": r"static/"}),
	(r"/gremlin/query", BmegGremlinQueryHandler.BmegGremlinQueryHandler),
	(r"/sigQuery", BmegSigDbQueryHandler.BmegSigDbQueryHandler)
])

# start server
if __name__ == "__main__":
	server = wsgiref.simple_server.make_server('', portNumber, application)
	server.serve_forever()
