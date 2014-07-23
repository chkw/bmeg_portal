# Deploy a page.

PAGE_NAME = data_summary

APACHE_STATIC_DIR = /var/www/html
APACHE_WSGI_DIR = /var/www/wsgi

test:

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
	rm -f 1.tmp 2.tmp 3.tmp ;
	\

deploy: deploy_wsgi deploy_client

deploy_wsgi:
	rsync -avP ./*.wsgi $(APACHE_WSGI_DIR)/. ;
	rsync -avP ./*.py $(APACHE_WSGI_DIR)/. --exclude="bmeg_server.py" --delete-excluded ;
	rsync -avP ./*.cfg $(APACHE_WSGI_DIR)/. ;

deploy_client:
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

