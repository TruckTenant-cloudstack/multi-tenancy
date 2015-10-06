package com.bimarian.main;

/**
 * BatchAnalytics program contains main() consumes data from HBase table
 * Performs transformations on the HBase table based on tenantId using SPARK SQL
 */
public class BatchAnalytics1 {

	public static void main(String[] args) {
		
		if(args[0].contains("truckInfo")) { 
			Truck1 truckBatchAnalytics = new Truck1();
			truckBatchAnalytics.getTruckDataAnalytics(args);
		}
		else {
			Truck1 truckBatchAnalytics = new Truck1();
			truckBatchAnalytics.getTruckDataAnalytics(args);
		}
	}
}