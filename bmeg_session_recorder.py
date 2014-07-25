"""bmeg_session_recorder.py:
May 2014	chrisw

Read/write session information to database.

"""

import pymongo

import sys
import datetime
import json
import ConfigParser

config = ConfigParser.ConfigParser({'host':'localhost', 'port':'27017', 'db':'bmeg_sessions'})
config.read('bmeg.cfg')
client = pymongo.MongoClient(config.get('mongod', 'host'), int(config.get('mongod', 'port'), 0))
db = client[config.get('mongod', 'db')]

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
	try:
		mongoIdList = []
		cursor = db[collectionName].find({'id':id}).sort('timeStamp', pymongo.DESCENDING)
		for doc in cursor:
			id = doc['id']
			objectId = doc['_id']  # bson.objectid.ObjectId
			mongoIdList.append(objectId)
		logStdErr(str(len(mongoIdList)) + ' docs: ' + str(mongoIdList))
	except Exception, err:
		logStdErr('error with getRecords: ' + str(err))
#  	client.disconnect()

def writeSession(id, data, collectionName='sessions'):
	input = {}
	input['id'] = id
	input['timeStamp'] = getTime()
	input['queryObject'] = data
	try:
		db[collectionName].insert(input)
	except Exception, err:
		logStdErr('error with writeSession: ' + str(err))
#  	client.disconnect()
