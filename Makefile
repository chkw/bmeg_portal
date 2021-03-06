# Deploy a page.

PAGE_NAME = data_summary

APACHE_STATIC_DIR = /var/www/html
APACHE_WSGI_DIR = /var/www/wsgi

test:

update:
	git checkout -- * ;
	\
	git pull

edit:
	echo "set path to query server" ;
	\
	sed -e 's,bmeg_service_host = "",bmeg_service_host = "/gremlin",' \
		static/$(PAGE_NAME)/scripts/bmeg_query.js \
	> 1.tmp ;
	\
	mv 1.tmp static/$(PAGE_NAME)/scripts/bmeg_query.js ;
	\
	echo "set path to config file" ;
	\
	sed -e "s,config.read('bmeg.cfg'),config.read('/var/www/wsgi/bmeg.cfg')," bmeg_session_recorder.py \
	> 2.tmp ;
	\
	mv 2.tmp bmeg_session_recorder.py ;
	\
	sed -e "s,config.read('bmeg.cfg'),config.read('/var/www/wsgi/bmeg.cfg')," query_gremlin.py \
	> 3.tmp ;
	\
	mv 3.tmp query_gremlin.py ;
	\
	sed -e "s,config.read('bmeg.cfg'),config.read('/var/www/wsgi/bmeg.cfg')," memcached_check.py \
	> 4.tmp ;
	\
	mv 4.tmp memcached_check.py ;
	\
	sed -e "s,config.read('bmeg.cfg'),config.read('/var/www/wsgi/bmeg.cfg')," BmegSigDbQueryHandler.py \
	> 5.tmp ;
	\
	mv 5.tmp BmegSigDbQueryHandler.py ;
	\
	rm -f 1.tmp 2.tmp 3.tmp 4.tmp 5.tmp ;
	\

deploy: update edit deploy_wsgi deploy_client
	~/apache_restart.sh ;
	\

deploy_wsgi:
	rsync -avP ./*.wsgi $(APACHE_WSGI_DIR)/. ;
	rsync -avP ./*.py $(APACHE_WSGI_DIR)/. --exclude="bmeg_server.py" --delete-excluded ;
	rsync -avP ./*.cfg $(APACHE_WSGI_DIR)/. ;

deploy_client:
	rsync -avP static/index.* $(APACHE_STATIC_DIR)/. ;
	rsync -avP static/images $(APACHE_STATIC_DIR)/. ;
	rsync -avP static/*.css $(APACHE_STATIC_DIR)/. ;
	rsync -avP static/*.js $(APACHE_STATIC_DIR)/. ;
	rsync -avP static/bower_components $(APACHE_STATIC_DIR)/. ;
	rsync -avP static/$(PAGE_NAME).html $(APACHE_STATIC_DIR)/. ;
	rsync -avP --exclude="static/$(PAGE_NAME)/scripts/static.js" --exclude="static/$(PAGE_NAME)/data/" --delete-excluded static/$(PAGE_NAME) $(APACHE_STATIC_DIR)/. ;
	rsync -avP ../staticJs/static.js $(APACHE_STATIC_DIR)/$(PAGE_NAME)/scripts/.

remove: remove_wsgi remove_client

remove_wsgi:
	rm -f $(APACHE_WSGI_DIR)/* ;
	\

remove_client:
	rm -rf $(APACHE_STATIC_DIR)/$(PAGE_NAME)* ;
	\

