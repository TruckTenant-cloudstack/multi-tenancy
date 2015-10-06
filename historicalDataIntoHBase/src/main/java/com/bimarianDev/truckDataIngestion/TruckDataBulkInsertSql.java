package com.bimarianDev.truckDataIngestion;

import java.io.FileNotFoundException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.rdd.RDD;
import org.apache.spark.sql.api.java.DataType;
import org.apache.spark.sql.api.java.JavaSQLContext;
import org.apache.spark.sql.api.java.JavaSchemaRDD;
import org.apache.spark.sql.api.java.Row;
import org.apache.spark.sql.api.java.StructField;
import org.apache.spark.sql.api.java.StructType;

import com.cloudera.spark.hbase.JavaHBaseContext;


public class TruckDataBulkInsertSql implements Serializable {

	private static final long serialVersionUID = 8310463030761304020L;

	public static void main(String[] args) throws  FileNotFoundException {
		SparkConf conf = new SparkConf().setAppName("Truck Data Bulk Insert");

		String [] inputFilePath = {"hdfs://hadoop1.test.com:8020/user/root/bhanu/datagen0910_vrl_service_12060100122_6MONdata_hyd_Siddipet_linux.json",
				"hdfs://hadoop1.test.com:8020/user/root/bhanu/datagen0910_vrl_service_12060100122_6MONdata_hyd_Vijayawada_linux.json",
				"hdfs://hadoop1.test.com:8020/user/root/bhanu/datagen0910_vrl_service_12060100122_6MONdata_hyd_Warangal_linux.json"};

		JavaSparkContext javaSparkContext = new JavaSparkContext(conf);
		JavaSQLContext sqlContext = new JavaSQLContext(javaSparkContext);
		
		List<StructField> fields = new ArrayList<StructField>();
		fields.add(DataType.createStructField("TNo", DataType.StringType,true));
		 fields.add(DataType.createStructField("VNo", DataType.StringType,true));
		 fields.add(DataType.createStructField("groupId", DataType.StringType,true));
		 fields.add(DataType.createStructField("deploymentId", DataType.StringType,true));
		 fields.add(DataType.createStructField("Time", DataType.StringType,true));
		 fields.add(DataType.createStructField("Acc", DataType.StringType,true));
		 fields.add(DataType.createStructField("Lat", DataType.DoubleType,false));
		 fields.add(DataType.createStructField("Lon", DataType.DoubleType,false));
		 fields.add(DataType.createStructField("Speed", DataType.DoubleType,false));
		 fields.add(DataType.createStructField("Angle", DataType.IntegerType,true));
		 fields.add(DataType.createStructField("Locate", DataType.StringType,true));
		 fields.add(DataType.createStructField("Oil", DataType.DoubleType,false));
		 fields.add(DataType.createStructField("Weight", DataType.DoubleType,false));
		 fields.add(DataType.createStructField("Mile", DataType.DoubleType,false));
		 fields.add(DataType.createStructField("version", DataType.StringType,true));
		 fields.add(DataType.createStructField("timestamp", DataType.StringType,true));
		 fields.add(DataType.createStructField("Location", DataType.StringType,true));
		StructType schema = DataType.createStructType(fields);
		
		for(int i=0;i<inputFilePath.length;i++){
		JavaSchemaRDD shemaRDD = sqlContext.jsonFile(inputFilePath[i],schema);
		shemaRDD.registerTempTable("truck_table");
		shemaRDD.printSchema();
		
		String sql = "SELECT * FROM truck_table";
		
		JavaSchemaRDD shemaRDDData = sqlContext.sql(sql);
		
		
		 RDD<Row> truckRows = shemaRDDData.rdd();
		JavaRDD<TruckBean> truckRDD=truckRows.toJavaRDD().map(new Function<Row, TruckBean>() {
			private static final long serialVersionUID = 6537558514444728202L;
			@Override
			public TruckBean call(Row row) throws Exception {
				if(row.isNullAt(0)||row.isNullAt(1)||row.isNullAt(2)||row.isNullAt(3)||row.isNullAt(4)||row.isNullAt(5)||row.isNullAt(6)||row.isNullAt(7)
						||row.isNullAt(8)||row.isNullAt(9)||row.isNullAt(10)||row.isNullAt(11)||row.isNullAt(12)||row.isNullAt(13)||row.isNullAt(14)||row.isNullAt(15)||row.isNullAt(16)){
					System.out.println("-----------row: "+row);
					return null;
				}
				TruckBean bean = new TruckBean();
				System.out.println("-----------row: "+row);
				bean.setTNo(row.getString(0));
				bean.setVNo(row.getString(1));
				bean.setGroupId(row.getString(2));
				bean.setDeploymentId(row.getString(3));
				bean.setTime(row.getString(4));
				bean.setAcc(row.getString(5));
				bean.setLat(row.getDouble(6));
				bean.setLon(row.getDouble(7));
				bean.setSpeed(row.getDouble(8));
				bean.setAngle(row.getInt(9));
				bean.setLocate(row.getString(10));
				bean.setOil(row.getDouble(11));
				bean.setWeight(row.getDouble(12));
				bean.setMile(row.getDouble(13));
				bean.setVersion(row.getString(14));
				bean.setTimestamp(row.getString(15));
				bean.setLocation(row.getString(16));
				//System.out.println(row);
				
				return bean;
			}
		}).filter(new Function<TruckBean, Boolean>() {
			private static final long serialVersionUID = 1L;
			@Override
			public Boolean call(TruckBean bean) throws Exception {
				if(bean == null) {
					return false;
				}
				return true;
			}
		});
		
		System.out.println("------------------rdd: "+truckRDD.count());
		Configuration hconf = HBaseConfiguration.create();
		hconf.addResource(new Path("/etc/hbase/conf.cloudera.yarn/core-site.xml"));
		hconf.addResource(new Path("/etc/hbase/conf.cloudera.hbase/hbase-site.xml"));
		
		JavaHBaseContext hbaseContext =new JavaHBaseContext(javaSparkContext,hconf);
		
		hbaseContext.bulkPut(truckRDD,"TruckData",new PutFunction(), true);
		}
		javaSparkContext.stop();
		
		}
		@SuppressWarnings("serial")
		public static class PutFunction implements Function<TruckBean, Put>{
			@Override
			public Put call(TruckBean tbean) throws Exception {
				System.out.println("truck in put method: "+tbean.toString());
				 Put put = new Put(Bytes.toBytes(tbean.getTimestamp()+"_"+tbean.getVNo()));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("TNo")),(Bytes.toBytes(tbean.getTNo())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("VNo")),(Bytes.toBytes(tbean.getVNo())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("groupId")),(Bytes.toBytes(tbean.getGroupId())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("deploymentId")),(Bytes.toBytes( tbean.getDeploymentId())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Time")),(Bytes.toBytes( tbean.getTime())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Acc")),(Bytes.toBytes( tbean.getAcc())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Lat")),(Bytes.toBytes( tbean.getLat())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Lon")),(Bytes.toBytes( tbean.getLon())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Speed")),(Bytes.toBytes( tbean.getSpeed())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Angle")),(Bytes.toBytes( tbean.getAngle())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Locate")),(Bytes.toBytes( tbean.getLocate())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Oil")),(Bytes.toBytes( tbean.getOil())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Weight")),(Bytes.toBytes( tbean.getWeight())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Mile")),(Bytes.toBytes( tbean.getMile())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("version")),(Bytes.toBytes( tbean.getVersion())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("timestamp")),(Bytes.toBytes( tbean.getTimestamp())));
				 put.add((Bytes.toBytes("truckParameters")),(Bytes.toBytes("Location")),(Bytes.toBytes( tbean.getLocation())));
				 
				return put;
			}
			
	}
}
