package com.bimarian.main;

import java.io.Serializable;

import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.function.Function;

import com.bimarian.beans.TruckDeviceBean;
import com.cloudera.spark.hbase.JavaHBaseContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * 	TruckManager program ingests Truck tenant's event stream(rawdata) into HBase table
 */
public class TruckManager implements Serializable {
	
	private static final long serialVersionUID = -4247313821610552405L;
	
	private static final Log log = LogFactory.getLog(TruckManager.class);

	/**
	 * @param hBaseContext - Contains JavaHBaseContext object
	 * @param truckRdd - Contains event stream(raw data) in the form of RDD
	 */
	
	public void pushRawDataToHBase(JavaHBaseContext javaHBaseContext,JavaRDD<TruckDeviceBean> truckRdd) {
		try {
			javaHBaseContext.bulkPut(truckRdd, "VRL",new Function<TruckDeviceBean, Put>() {
				
				private static final long serialVersionUID = 8608295743018814921L;

				// @Override
				@SuppressWarnings("deprecation")
				public Put call(TruckDeviceBean rawDataBean)throws Exception {
					long systemTime = System.currentTimeMillis();
					Put put = new Put(Bytes.toBytes(String.valueOf(systemTime)));
					String[] location = rawDataBean.getLocation().split(",");
					put.add(Bytes.toBytes("details"), Bytes.toBytes("deploymentId"), Bytes.toBytes(String.valueOf(rawDataBean.getDeploymentId())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("groupId"), Bytes.toBytes(String.valueOf(rawDataBean.getGroupId())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("VNo"), Bytes.toBytes(String.valueOf(rawDataBean.getVNo())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Time"), Bytes.toBytes(String.valueOf(rawDataBean.getTime())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Acc"), Bytes.toBytes(String.valueOf(rawDataBean.getAcc())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Lat"), Bytes.toBytes(String.valueOf(rawDataBean.getLat())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Lon"), Bytes.toBytes(String.valueOf(rawDataBean.getLon())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Speed"), Bytes.toBytes(String.valueOf(rawDataBean.getSpeed())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Angle"), Bytes.toBytes(String.valueOf(rawDataBean.getAngle())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Locate"),Bytes.toBytes(String.valueOf(rawDataBean.getLocate())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Oil"),Bytes.toBytes(String.valueOf(rawDataBean.getOil())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Mile"), Bytes.toBytes(String.valueOf(rawDataBean.getMile())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("version"), Bytes.toBytes(String.valueOf(rawDataBean.getVersion())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("timestamp"), Bytes.toBytes(String.valueOf(rawDataBean.getTimestamp())));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Location[0]"), Bytes.toBytes(String.valueOf(location[0])));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("Location[1]"), Bytes.toBytes(String.valueOf(location[1])));
					put.add(Bytes.toBytes("details"), Bytes.toBytes("weight"), Bytes.toBytes(String.valueOf(rawDataBean.getWeight())));
					put.add(Bytes.toBytes("details"),Bytes.toBytes("TNo"),Bytes.toBytes(String.valueOf(rawDataBean.getTNo())));
					return put;
				}
			}, true);
		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
		}
	}
}
