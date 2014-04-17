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
	
def getAllPatients():
	script = "g.V('type','tcga_attr:Patient')"
	return query_bmeg(script)

def queryGender():
	strList = []
	strList.append("t=new Table();")
	strList.append("g.V('type','tcga_attr:Gender')")
	strList.append(".as('genderV')")
	strList.append(".in('tcga_attr:gender')")
	strList.append(".has('type','tcga_attr:Patient').id.as('patientVId')")
	strList.append(".table(t).cap()")
	return query_bmeg('' + strList.join())

def queryDiseaseCode():
	strList = []
	strList.append("t=new Table();")
	strList.append("g.V('type','tcga_attr:Patient')")
	strList.append(".as('patientV')")
	strList.append(".out('tcga_attr:disease_code')")
	strList.append(".name.as('diseaseCode')")
	strList.append(".table(t).cap()")
	return query_bmeg('' + strList.join())
	
def queryMutationStatus(hugoIdList):
	strList = []
	strList.append("x=[];")
	
	for hugoId in hugoIdList:
		strList.append("g.V('name','hugo:" + hugoId + "').store(x).next();")
	
	strList.append("x._()")
	strList.append(".as('hugo')")
	strList.append(".in('bmeg:gene')")
	strList.append(".as('mutation_event')")
	strList.append(".out('bmeg:effect')")
	strList.append(".as('effect')")
	strList.append(".back('mutation_event')")
	strList.append(".out('bmeg:analysis')")
	strList.append(".out('bmeg:variant')")
	strList.append(".out('tcga_attr:patient')")
	strList.append(".has('type','tcga_attr:Patient').id.as('patientVId')")
	strList.append(".table(t).cap()")

	return query_bmeg('' + strList.join())
	
	
