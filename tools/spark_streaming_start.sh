#!/bin/bash

#
## Script to run the Spark streaming job
#

BASE_DIR=`dirname $0`
spark-submit --master yarn-client --driver-class-path $BASE_DIR/lib/SparkHBase.jar:$BASE_DIR/lib/spark-hbase-0.0.2-clabs.jar:$BASE_DIR/lib/htrace-core-3.1.0-incubating.jar --class com.bimarian.main.TenantHandler $BASE_DIR/bimarian-streaming.jar 127.0.0.1:2181 group1 5 $BASE_DIR/tenants.cfg 5000
