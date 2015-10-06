Batch Analytics

Overview
---------
This project is intended to show how to integrate Reading Data From HBase table -> perform SPARK SQL Operations -> Write aggregated data into HBase tables

Functionality
--------------
There is a Main class in com.bimarian.main, This class does the following functions:
- BatchAnalytics:
	-  This class calculates transformations based on tenantId, query which are recived from freeboard UI
		
How to use
------------
- Generate jar file using below command:
	-  mvn clean install -DskipTests=true
