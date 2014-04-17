#!/usr/bin/python
"""query_gremlin.py:
April 2014	chrisw

Methods for building and submitting Groovy-flavored Gremlin query scripts to Rexster.

"""

import sys
import datetime
import urllib2
import json

def test():
	return (str(getTime()) + ": this is query_gremlin")

def getTime():
	now = datetime.datetime.now()
	return now

def prettyJson(object):
 	jo = (json.loads(object) if (isinstance(object, basestring)) else object)
	s = json.dumps(jo, sort_keys=True, indent=4, separators=(',', ': '))
	return s

# query rexster as in https://github.com/tinkerpop/rexster/wiki/Gremlin-Extension				
def query_bmeg(gremlin_script_groovy_flavor, rexster_uri=r"http://localhost:8182/graphs/graph/tp/gremlin"):
	url = rexster_uri + "?script=" + gremlin_script_groovy_flavor
	try:
		response = urllib2.urlopen(url).read()
# 		sys.stderr.write("response\t" + prettyJson(response) + "\n")
		return response
	except Exception, err:
		sys.stderr.write(str(err) + "\n")
		sys.stderr.write("url\t" + url + "\n")
		return {"success":False}
