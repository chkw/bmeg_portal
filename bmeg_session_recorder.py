"""bmeg_session_recorder.py:
May 2014	chrisw

Read/write session information to database.

"""

import pymongo

import sys
import datetime
import json
import ConfigParser

config = ConfigParser.ConfigParser({'host':'localhost', 'port':'27017'})
config.read('bmeg.cfg')
client = pymongo.MongoClient(config.get('mongod', 'host'), int(config.get('mongod', 'port'), 0))
db = client['bmeg_sessions']

def test():
	return (str(getTime()) + ": this is query_gremlin")

def logStdErr(message):
	sys.stderr.write(str(getTime()) + "\tbmeg_session_recorder\t" + message + "\n")

def getTime():
	now = datetime.datetime.now()
	return now

def prettyJson(object):
 	jo = (json.loads(object) if (isinstance(object, basestring)) else object)
	s = json.dumps(jo, sort_keys=True, indent=4, separators=(',', ': '))
	return s

def getRecords(id, collectionName='sessions'):
	logStdErr('getRecords')
	result = db[collectionName].find({'id':id}).sort('timeStamp').count()
	logStdErr(str(result))
	
	client.close()

def writeSession(id, data, collectionName='sessions'):
	logStdErr('writeSession')
	input = {}
	input['id'] = id
	input['timeStamp'] = getTime()
	input['queryObject'] = data
	
	db[collectionName].insert(input)

	client.disconnect()
