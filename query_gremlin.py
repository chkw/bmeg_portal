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
  	
def query_bmeg_paged(gremlin_script_groovy_flavor, batch_size=3000, rexster_uri=rexsterServerUrl + r"/graphs/graph/tp/gremlin", logQuery=False):
	# get total number of records
	query_result = query_bmeg(gremlin_script_groovy_flavor + '.count()')
	total_count = json.loads(query_result)['results'][0]
	
	# get tuples of start,end indices
	start = 0
	end = batch_size
	batch_indices = []
	while end < total_count:
		batch_indices.append((str(start), str(end)))
		start += (batch_size + 1)
		end += (batch_size + 1)
	if end >= total_count:
		end = total_count - 1
		batch_indices.append((start, end))
		
	# get paged results
	pages = []
	for batch in batch_indices:
		start = batch[0]
		end = batch[1]
		query_result = query_bmeg(gremlin_script_groovy_flavor + '[' + str(start) + '..' + str(end) + ']')
		pages.append(query_result)
		
	# assemble paged results into one result
	completeResult = {}
	completeResult['success'] = True
	completeResult['results'] = []
	
	for page in pages:
		partialResult = json.loads(page)
		success = partialResult['success']
		if (not success):
			completeResult['success'] = False
		completeResult['results'] = completeResult['results'] + partialResult['results']
	
	return completeResult
	
### QUERIES ###	

def getAllPatients():
	return getAllPatientIdByIndex()

def getAllPatientIdByIndex():
	script = r"g.query().has('type', EQUAL, 'tcga_attr:Patient').vertices()._().id"
	result = query_bmeg_paged(script)
	return result

def queryGender():
# 	t=new Table();g.V('type','tcga_attr:Gender').as('genderV').in('tcga_attr:gender').has('type','tcga_attr:Patient').id.as('patientVId').table(t).cap()
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
	
	
