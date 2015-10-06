package com.bimarian.main;

import java.io.IOException;

/**
 * BatchAnalytics program contains main() consumes data from HBase table
 * Performs transformations on the HBase table based on tenantId using SPARK SQL
 */
public class BatchAnalytics {

	public static void main(String[] args) throws IOException {
		
		if(args[0].contains("truckInfo")) { 
			Truck truckBatchAnalytics = new Truck();
			truckBatchAnalytics.getTruckDataAnalytics(args);
		}
		else {
			Truck truckBatchAnalytics = new Truck();
			truckBatchAnalytics.getTruckDataAnalytics(args);
		}
	}
}