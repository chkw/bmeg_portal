# Deploy a page.

PAGE_NAME = data_summary

APACHE_STATIC_DIR = /data/www/html
APACHE_WSGI_DIR = /var/www/wsgi

test:

deploy_wsgi:
	rsync -avP ./*.wsgi $(APACHE_WSGI_DIR)/. ;
	rsync -avP ./*.py $(APACHE_WSGI_DIR)/. --exclude="bmeg_server.py" --delete-excluded ;

deploy_client:
	rsync -avP $(PAGE_NAME).html $(APACHE_STATIC_DIR)/. ;
	rsync -avP --exclude="$(PAGE_NAME)/data/" --delete-excluded $(PAGE_NAME) $(APACHE_STATIC_DIR)/. ;
	
remove_wsgi:
	rm -f $(APACHE_WSGI_DIR)/* ;
	\
