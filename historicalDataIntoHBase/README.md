Pushing Generated Historical data into HBase

Overview
---------
This project is intended to show how to ingest generated historical JSON input data files into HBase table

Functionality
--------------
There is a Main class in com.bimarianDev.truckDataIngestion, This class does the following functions:
- TruckDataBulkInsertSql:
	-  Main functionality of this class is to convert json data into truckbean RDD->using bulkPut() pushes data into HBase table
		
How to use
------------
- Generate jar file using below command:
	-  mvn clean install -DskipTests=true
- Run the following command:
	-  spark-submit --master yarn-client --class com.bimarianDev.truckDataIngestion.TruckDataBulkInsertSql /root/TruckTenant-cloudstack/multi-tenancy/historicalDataIntoHBase/target/TruckDataIngestion-0.0.1-SNAPSHOT-jar-with-dependencies.jar
