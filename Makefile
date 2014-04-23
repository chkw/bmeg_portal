# Deploy a page.

PAGE_NAME = data_summary

APACHE_STATIC_DIR = /var/www/html
APACHE_WSGI_DIR = /var/www/wsgi

test:

deploy_wsgi:
	rsync -avP ./*.wsgi $(APACHE_WSGI_DIR)/. ;
	rsync -avP ./*.py $(APACHE_WSGI_DIR)/. --exclude="bmeg_server.py" --delete-excluded ;

deploy_client:
	rsync -avP static/$(PAGE_NAME).html $(APACHE_STATIC_DIR)/. ;
	rsync -avP --exclude="static/$(PAGE_NAME)/scripts/static.js" --exclude="static/$(PAGE_NAME)/data/" --delete-excluded static/$(PAGE_NAME) $(APACHE_STATIC_DIR)/. ;
	rysnc -avP ../staticJs/static.js $(APACHE_STATIC_DIR)/$(PAGE_NAME)/scripts/static/.

remove_wsgi:
	rm -f $(APACHE_WSGI_DIR)/* ;
	\
