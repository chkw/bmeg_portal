# Deploy a page.

PAGE_NAME = data_summary

TARGET_DIR = /data/www/html

test:

deploy:
	rsync -avP $(PAGE_NAME).html $(TARGET_DIR)/. ;
	\
	rsync -avP --exclude="$(PAGE_NAME)/data/" --delete-excluded $(PAGE_NAME) $(TARGET_DIR)/. ;
	\
	
remove:
	rm -f $(TARGET_DIR)/$(PAGE_NAME).html ;
	\
	rm -rf $(TARGET_DIR)/$(PAGE_NAME)/ ;
	\

