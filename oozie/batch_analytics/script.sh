#!/bin/sh

spark-submit --master local --driver-class-path htrace-core-3.1.0-incubating.jar --class com.bimarian.main.BatchAnalytics bimarian-batch-0.0.1-SNAPSHOT-jar-with-dependencies.jar "$1" "$2"
