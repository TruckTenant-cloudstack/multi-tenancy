HBase Rest API's

Overview
---------
Rest API services will query on Hbase tables based on tenant's id and device id, then returns the data in Jason format to Freeboard dashboard.

Functionality
--------------
Here we are showing Rest API services for Truck tenant.

- Service 1:
	- URL: http://192.168.1.29:8080/bimarian-rest/service/getRecord?tenantId=VRL&deviceId=Truck1
	- To plot the graphs: "GoogleMap"
- Service 2:
	- URL: http://192.168.1.29:8080/bimarian-rest/service/getTransformedRecords?recordsCount=10&tenantId=VRL&deviceId=Truck1
	- To plot the graphs: "Oil vs Time", "Weight vs Time"
- Service 3:
	- URL: http://192.168.1.39:8080/bimarian-rest/service/getAnalyzedRecord?tenantId=VRL&deviceId=batch-analytics
	- To plot the graph: "Bar graph in batch analytics"

How to use
------------
- Generate war file using below command:
    - mvn clean install -DskipTests=true
- Deploy generated "bimarian-rest.war" from target directory  into /opt/jetty/webapps

