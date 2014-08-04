"""memcached_check.py:
July 2014	chrisw

Set/get key/value pairs in memcached service

"""
import ConfigParser
import pylibmc

config = ConfigParser.ConfigParser({'server':'localhost'})
config.read('bmeg.cfg')

mc = pylibmc.Client([config.get('memcached', 'server')])

def keyExists(key):
	result = (key in mc)
	return result

def setCache(key, value):
	result = mc.set(str(key), str(value))
	return result

def getCache(key):
	result = mc.get(str(key))
	return result
