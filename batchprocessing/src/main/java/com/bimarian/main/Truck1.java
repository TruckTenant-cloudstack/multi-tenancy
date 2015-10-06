package com.bimarian.main;

import java.io.Serializable;
import java.math.BigDecimal;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.hbase.mapreduce.TableInputFormat;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.sql.api.java.JavaSQLContext;
import org.apache.spark.sql.api.java.JavaSchemaRDD;
import org.apache.spark.sql.api.java.Row;

import scala.Tuple2;

import com.bimarian.beans.TruckDeviceBean;
import com.bimarian.beans.TruckResultBean;
import com.cloudera.spark.hbase.JavaHBaseContext;

/**
 * Truck program calculates transformations based on tenantId, query received from freeboard UI
 */
public class Truck1 implements Serializable {

	private static final long serialVersionUID = -7791072220431387434L;

	public JavaRDD<TruckResultBean> getTruckDataAnalytics(String[] args) {

		SparkConf sparkConf = new SparkConf().setAppName("Batch Analytics");
		JavaSparkContext javaSparkContext = new JavaSparkContext(sparkConf);
		JavaSQLContext sqlContext = new JavaSQLContext(javaSparkContext);

		Configuration hbaseConfig = HBaseConfiguration.create();
		JavaHBaseContext hBaseContext = new JavaHBaseContext(javaSparkContext, hbaseConfig);
		
		Configuration conf = HBaseConfiguration.create();
		conf.set("hbase.zookeeper.quorum", "192.168.56.101");
		conf.set("hbase.zookeeper.property.clientPort", "2181");
		conf.set(TableInputFormat.INPUT_TABLE, args[0]);
		
		JavaPairRDD<ImmutableBytesWritable, Result> hbaseRDD = javaSparkContext.newAPIHadoopRDD(conf, TableInputFormat.class, ImmutableBytesWritable.class, Result.class);

		JavaRDD<TruckDeviceBean> truckRDD = hbaseRDD.map(new Function<Tuple2<ImmutableBytesWritable,Result>, TruckDeviceBean>() {
			private static final long serialVersionUID = -2021713021648730786L;
			public TruckDeviceBean call(Tuple2<ImmutableBytesWritable, Result> tuple) {
				TruckDeviceBean bean = new TruckDeviceBean();
				try {
					Result result = tuple._2;
					bean.setTimestamp(Bytes.toString(tuple._2.getRow()));
					bean.setDeploymentId(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("deploymentId"))));
					bean.setGroupId(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("groupId"))));
					bean.setTime(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Time"))));
					bean.setAcc(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Acc"))));
					bean.setLocate(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Locate"))));
					bean.setLocation(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Location"))));
					bean.setLat(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Lat")))).setScale(2,BigDecimal.ROUND_HALF_UP).doubleValue());
					bean.setLon(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Lon")))).setScale(2,BigDecimal.ROUND_HALF_UP).doubleValue());
					bean.setSpeed(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Speed")))).setScale(2,BigDecimal.ROUND_HALF_UP).doubleValue());	
					bean.setWeight(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Weight")))).setScale(2,BigDecimal.ROUND_HALF_UP).doubleValue());
					bean.setOil(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Oil")))).setScale(2,BigDecimal.ROUND_HALF_UP).doubleValue());
					bean.setMile(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Mile")))).setScale(2,BigDecimal.ROUND_HALF_UP).doubleValue());	
					bean.setAngle(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Angle")))).setScale(2,BigDecimal.ROUND_HALF_UP).intValue());
					bean.setVersion(new BigDecimal(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("version")))).setScale(2,BigDecimal.ROUND_HALF_UP).intValue());
					bean.setVNo(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("VNo"))));
					bean.setTNo(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"),Bytes.toBytes("TNo"))));
					return bean;
				} catch(Exception e) {
					e.printStackTrace();
					return null;
				}
			}
		}).filter(new Function<TruckDeviceBean, Boolean>() {
			private static final long serialVersionUID = 1L;
			public Boolean call(TruckDeviceBean bean) throws Exception {
				if (bean != null)
					return true;
				return false;
			}
		}).cache();
//		truckRDD.saveAsTextFile("truckRDD.csv");
		JavaSchemaRDD schemaRDD = sqlContext.applySchema(truckRDD, TruckDeviceBean.class);
		schemaRDD.registerTempTable(args[0]);
		JavaSchemaRDD output = sqlContext.sql(args[1]);	
				
//		output.saveAsTextFile("output.csv");
		
		final JavaRDD<TruckResultBean> finalOutput = output.map(new Function<Row, TruckResultBean>() {
			private static final long serialVersionUID = -5938613558681395822L;
			public TruckResultBean call(Row row) throws Exception {
				TruckResultBean bean = new TruckResultBean();
				bean.setVNo(row.getString(0));
				bean.setCount(row.getLong(1));
//				bean.setSpeed(row.getDouble(0));
				return bean;
			}
		});
		
		ingestAggregatedDataToHBase(hBaseContext, finalOutput );

//		javaSparkContext.stop();
		javaSparkContext.close();
		return finalOutput;
	}	
	
	/**
	 * Ingest aggregated data into HBase table
	 * @param hBaseContext - Contains JavaHBaseContext object
	 * @param finalOutput  - Contains aggregated data obtained from SPARK SQL
	 */
//		public static void ingestAggregatedDataToHBase(JavaHBaseContext hBaseContext,JavaRDD<TruckResultBean> finalOutput) {
//			try {
//				 finalOutput.foreach(new VoidFunction<TruckResultBean>() {
//					private static final long serialVersionUID = -4135958955665677268L;
//					@Override
//					public void call(TruckResultBean bean) throws Exception {
//						Configuration hbaseConfig = HBaseConfiguration.create();
//						HTable hTable = new HTable(hbaseConfig, "VRL-Transformations");
//						 Put put = new Put(Bytes.toBytes(String.valueOf(System.currentTimeMillis()))); 
//					      put.add(Bytes.toBytes("analytics"),Bytes.toBytes("VNo"),Bytes.toBytes(String.valueOf(bean.getVNo())));
//					      put.add(Bytes.toBytes("analytics"),Bytes.toBytes("Count"),Bytes.toBytes(String.valueOf(bean.getCount())));
////					      put.add(Bytes.toBytes("analytics"),Bytes.toBytes("Speed"),Bytes.toBytes(bean.getSpeed().doubleValue()));
//					      hTable.put(put); 
//					      hTable.close();
//					     }
//					});
//			} catch (Exception e) {
//				e.printStackTrace();
//			}
//		}
		
		public static void ingestAggregatedDataToHBase(JavaHBaseContext hBaseContext,JavaRDD<TruckResultBean> finalOutput) {
			try {
				hBaseContext.bulkPut(finalOutput, "VRL-Transformations",new Function<TruckResultBean, Put>() {	
					private static final long serialVersionUID = -6113654085443729475L;

					public Put call(TruckResultBean dataBean)throws Exception {
						Put put = new Put(Bytes.toBytes(String.valueOf(System.currentTimeMillis())));	
						put.add(Bytes.toBytes("analytics"),Bytes.toBytes("VNo"),Bytes.toBytes(String.valueOf(dataBean.getVNo())));
				        put.add(Bytes.toBytes("analytics"),Bytes.toBytes("Count"),Bytes.toBytes(String.valueOf(dataBean.getCount())));
						return put;
					}
				}, true);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}