"""query_gremlin.py:
April 2014	chrisw

Methods for building and submitting Groovy-flavored Gremlin query scripts to Rexster.

"""

import sys
import datetime
import urllib
import urllib2
import json
import ConfigParser

config = ConfigParser.ConfigParser({'host':'localhost', 'port':'8182'})
config.read('bmeg.cfg')
rexsterServerUrl = "http://" + config.get('rexster', 'host') + ":" + config.get('rexster', 'port')

def test():
	return (str(getTime()) + ": this is query_gremlin")

def logStdErr(message):
	sys.stderr.write(str(getTime()) + "\t" + message + "\n")

def getTime():
	now = datetime.datetime.now()
	return now

def prettyJson(object):
 	jo = (json.loads(object) if (isinstance(object, basestring)) else object)
	s = json.dumps(jo, sort_keys=True, indent=4, separators=(',', ': '))
	return s

# query rexster as in https://github.com/tinkerpop/rexster/wiki/Gremlin-Extension				
def query_bmeg(gremlin_script_groovy_flavor, rexster_uri=rexsterServerUrl + r"/graphs/graph/tp/gremlin", logQuery=False):
	queryMapping = {"script": gremlin_script_groovy_flavor}
	if logQuery:
		logStdErr(prettyJson(queryMapping))
	queryString = urllib.urlencode(queryMapping)
	url = rexster_uri + "?" + queryString
	try:
		response = urllib2.urlopen(url).read()
# 		sys.stderr.write("response\t" + prettyJson(response) + "\n")
		return response
 	except Exception, err:
  		logStdErr(str(err))
  		logStdErr("url\t" + url)
  		return {"success":False, "query":gremlin_script_groovy_flavor, "error":str(err)}
	
### QUERIES ###	

def getAllPatients():
	script = r"g.V('type','tcga_attr:Patient')"
	return query_bmeg(script)

def queryGender():
	strList = []
	strList.append("t=new Table();")
	strList.append("g.V('type','tcga_attr:Gender')")
	strList.append(".as('genderV')")
	strList.append(".in('tcga_attr:gender')")
	strList.append(".has('type','tcga_attr:Patient').id.as('patientVId')")
	strList.append(".table(t).cap()")
	return query_bmeg(''.join(strList))

def queryDiseaseCode():
	strList = []
	strList.append("t=new Table();")
	strList.append("g.V('type','tcga_attr:Patient')")
	strList.append(".as('patientV')")
	strList.append(".out('tcga_attr:disease_code')")
	strList.append(".name.as('diseaseCode')")
	strList.append(".table(t).cap()")
	return query_bmeg(''.join(strList))
	
def queryMutationStatus(hugoIdList):
	strList = []
	strList.append("t=new Table();")
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

	return query_bmeg(''.join(strList))
	
	
