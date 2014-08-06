"""memcached_check.py:
July 2014	chrisw

Set/get key/value pairs in memcached service

"""
import ConfigParser
import pylibmc
import sys
import hashlib

config = ConfigParser.ConfigParser({'server':'localhost'})
config.read('bmeg.cfg')

server_list = [config.get('memcached', 'server')]
mc = pylibmc.Client(server_list)

def logStdErr(message):
	sys.stderr.write(message + "\n")

def getHash(str, algorithm='sha256'):
	return hashlib.new(algorithm, str).hexdigest()

def keyExists(key):
# 	mc = pylibmc.Client(server_list)
	result = (key in mc)
	return result

def setCache(key, value):
# 	mc = pylibmc.Client(server_list)
	try:
		result = mc.set(getHash(key), str(value))
	except Exception, err:
		logStdErr('exception setting memcache: ' + str(err))
		return None
	return result

def getCache(key):
# 	mc = pylibmc.Client(server_list)
	try:
		result = mc.get(getHash(key))
	except Exception, err:
		logStdErr('exception getting memcache: ' + str(err))
		return None
	return result
