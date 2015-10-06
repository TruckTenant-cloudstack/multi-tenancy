#!/bin/bash

#cleanup all the files and execute end to end truck tenant cloudstack setup
/opt/truck/multi_tenancy_poc_setup.sh cleanup
rm -rf /opt/truck
rm -rf /var/www/html/*
rm -rf /opt/jetty/logs/*
rm /opt/jetty/webapps/*.war
rm /etc/init.d/sparkstreaming
/root/trucktenant-cloudstack/multi-tenancy/setup.sh
/opt/truck/multi_tenancy_poc_setup.sh start
