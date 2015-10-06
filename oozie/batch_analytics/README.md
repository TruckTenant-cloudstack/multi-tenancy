Oozie


How to use
------------
- By using batchprocessing code generate jar file using below command:
	-  mvn clean install -DskipTests=true
- Create "lib" directory under "/user/root/batch_analytics/" in HDFS 
- Copy the generated dependency jar file from target directory to /user/root/batch_analytics/lib directory
- Copy multi-tenancy/tools/lib/htrace-core-3.1.0-incubating.jar to /user/root/batch_analytics/lib directory
