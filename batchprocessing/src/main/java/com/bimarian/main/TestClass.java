package com.bimarian.main;

import java.math.BigDecimal;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.Get;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.Row;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.sql.api.java.JavaSQLContext;
import org.apache.spark.sql.api.java.JavaSchemaRDD;

import scala.Tuple2;

import com.bimarian.beans.TruckDeviceBean;
import com.bimarian.beans.TruckResultBean;
import com.cloudera.spark.hbase.JavaHBaseContext;

public class TestClass {
	
	public static void main(String args[]) {
	
		SparkConf sparkConf=new SparkConf().setAppName("Test class");
		JavaSparkContext javaSparkContext=new JavaSparkContext(sparkConf);
		JavaSQLContext sqlContext = new JavaSQLContext(javaSparkContext);
		
		Configuration configuration=HBaseConfiguration.create();
		JavaHBaseContext javaHBaseContext=new JavaHBaseContext(javaSparkContext, configuration);
		
		Scan scan=new Scan();
		
		JavaRDD<byte[]> rowKeyRDD=javaHBaseContext.hbaseRDD(args[0], scan, new Function<Tuple2<ImmutableBytesWritable,Result>, byte[]>() {
			private static final long serialVersionUID = 1L;
			public byte[] call(Tuple2<ImmutableBytesWritable, Result> result)throws Exception {
			return result._2.getRow();
			}
		});
		
		JavaRDD<TruckDeviceBean> recordsRDD = javaHBaseContext.bulkGet(args[0], 5,rowKeyRDD , new GetFunction(), new ResultFunction());	
		
		System.out.println("-----------------------rdd count:"+recordsRDD.count());
		System.out.println("-----------------------data in rdd :"+recordsRDD.collect());
		
		JavaSchemaRDD schemaRDD = sqlContext.applySchema(recordsRDD, TruckDeviceBean.class);
		schemaRDD.registerTempTable(args[0]);
		String sql = args[1];
		JavaSchemaRDD output = sqlContext.sql(sql);	
				
//		final JavaRDD<TruckResultBean> finalOutput = output.map(new Function<Row, TruckResultBean>() {
//			private static final long serialVersionUID = -5938613558681395822L;
//			public TruckResultBean call(Row row) throws Exception {
//				TruckResultBean bean = new TruckResultBean();
//				bean.setOil(row.get(0) == null ? 0 : row.getDouble(0));
//				bean.setCount(row.get(1) == null ? 0 : row.getInt(1));
//				return bean;
//			}
//		});
//	
//		System.out.println("----------------final output is:"+ finalOutput.count());
	}

	 public static class GetFunction implements Function<byte[], Get> {
		 private static final long serialVersionUID = -2619379996179679376L;
		 public Get call(byte[] v) throws Exception {
		 return new Get(v);
		 }
	}
	 
	 public static class ResultFunction implements Function<Result, TruckDeviceBean> {
		private static final long serialVersionUID = 7795952461797416721L;

		public TruckDeviceBean call(Result result) throws Exception {
			TruckDeviceBean bean = new TruckDeviceBean();
			bean.setDeploymentId(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("deploymentId"))));
			bean.setGroupId(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("groupId"))));
			bean.setTime(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Time"))));
			bean.setAcc(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Acc"))));
			bean.setLocate(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("Locate"))));
			bean.setTimestamp(Bytes.toString(result.getValue(Bytes.toBytes("truckParameters"), Bytes.toBytes("timestamp"))));
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
		}	 
	 }
}
