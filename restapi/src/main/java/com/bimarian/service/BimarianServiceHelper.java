package com.bimarian.service;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.Cell;
import org.apache.hadoop.hbase.CellUtil;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.ResultScanner;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.filter.CompareFilter.CompareOp;
import org.apache.hadoop.hbase.filter.FilterList;
import org.apache.hadoop.hbase.filter.PageFilter;
import org.apache.hadoop.hbase.filter.SingleColumnValueFilter;
import org.apache.hadoop.hbase.util.Bytes;

public class BimarianServiceHelper {

	private Configuration config = null;

	public BimarianServiceHelper() {
		config = HBaseConfiguration.create();
		config.set("hbase.zookeeper.quorum", "127.0.0.1");
		config.set("hbase.zookeeper.property.clientPort", "2181");
	}

	public List<Map<String, String>> getRecord(final String tenantId, final String deviceId) throws IOException {
		Connection connection = null;
		Table table = null;
		ResultScanner resultScanner = null;
		
		List<Map<String, String>> list = new ArrayList<Map<String, String>>();

		try {
			connection = ConnectionFactory.createConnection(config);
			
			table = connection.getTable(TableName.valueOf(tenantId));

			SingleColumnValueFilter groupIdFilter = new SingleColumnValueFilter(Bytes.toBytes("details"), Bytes.toBytes("groupId"), CompareOp.EQUAL, Bytes.toBytes(deviceId));

			FilterList filterList = new FilterList(FilterList.Operator.MUST_PASS_ALL);
			filterList.addFilter(groupIdFilter);
			filterList.addFilter(new PageFilter(1));

			Scan scan = new Scan();
			scan.setCaching(10000);
			scan.setReversed(true);
			scan.setFilter(filterList);

			resultScanner = table.getScanner(scan);

			for (Result result = resultScanner.next(); result != null; result = resultScanner.next()) {
				Map<String, String> row = new HashMap<String, String>();
				row.put("rowkey", Bytes.toString(result.getRow()));

				for (Cell cell : result.listCells()) {
					row.put(Bytes.toString(CellUtil.cloneQualifier(cell)), Bytes.toString(CellUtil.cloneValue(cell)));
				}

				list.add(row);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (table != null) {
					table.close();
				}

				if (resultScanner != null) {
					resultScanner.close();
				}

				if (connection != null) {
					connection.close();
				}
			} catch (Exception e2) {
				e2.printStackTrace();
			}
		}

		return list;
	}

	public Map<String, List<Map<String, String>>> getTransformedRecords(int recordsCount, String tenantId, String deviceId ) {
		Connection connection = null;
		Table table = null;
		ResultScanner resultScanner = null;

		List<Map<String, String>> list = new ArrayList<Map<String, String>>();	
		Map<String, List<Map<String, String>>> finalResult = new HashMap<String, List<Map<String, String>>>();

		try {
			connection = ConnectionFactory.createConnection(config);

			if (deviceId.equalsIgnoreCase("all")) {
				table = connection.getTable(TableName.valueOf(tenantId+"-SparkSQL"));
			} else {
				table = connection.getTable(TableName.valueOf(tenantId));
			}

			SingleColumnValueFilter groupIdFilter = new SingleColumnValueFilter(Bytes.toBytes("details"), Bytes.toBytes("groupId"), CompareOp.EQUAL, Bytes.toBytes(deviceId));

			FilterList filterList = new FilterList(FilterList.Operator.MUST_PASS_ALL);
			filterList.addFilter(groupIdFilter);
			filterList.addFilter(new PageFilter(recordsCount));


			Scan scan = new Scan();
			scan.setCaching(10000);
			scan.setReversed(true);
			scan.setFilter(filterList);

			resultScanner = table.getScanner(scan);
			
			Set<String> setValue = new HashSet<String>();
//			SimpleDateFormat dateFormat = new SimpleDateFormat("kk:mm:ss");

			for (Result result = resultScanner.next(); result != null; result = resultScanner.next()) {
				Map<String, String> row =new HashMap<String, String>();
				row.put("rowkey", Bytes.toString(result.getRow()));

				for (Cell cell : result.listCells()) {
					setValue.add((Bytes.toString(CellUtil.cloneQualifier(cell))));
					row.put(Bytes.toString(CellUtil.cloneQualifier(cell)), Bytes.toString(CellUtil.cloneValue(cell)));
				}

				list.add(row);
			}

			Collections.reverse(list);

			for (String key : setValue) {
				for (Map<String, String> map : list) {
					if (map.containsKey(key)) {
						List<Map<String, String>> resultList = finalResult.get(key);

						if (resultList == null) {
							resultList = new ArrayList<Map<String, String>>();
						}

						Map<String, String> mapValue = new HashMap<String, String>();
						mapValue.put("value", map.get(key));
						mapValue.put("date", map.get("rowkey").split("_")[0]);
//						mapValue.put("date", dateFormat.format(new Date(Long.parseLong(map.get("rowkey").split("_")[0]))));
						resultList.add(mapValue);

						finalResult.put(key, resultList);
					}
				}
			}
		} catch (Exception e) {	
			e.printStackTrace();
		} finally {
			try {
				if (table != null) {
					table.close();
				}

				if (resultScanner != null) {
					resultScanner.close();
				}

				if (connection != null) {
					connection.close();
				}
			} catch (Exception e2) {
				e2.printStackTrace();
			}
		}
		
		return finalResult;
	}
	
	public List<Map<String, String>> getTransformedRecord(final String tenantId, final String deviceId) throws IOException {
		Connection connection = null;
		Table table = null;
		ResultScanner resultScanner = null;
		
		List<Map<String, String>> list = new ArrayList<Map<String, String>>();

		try {
			connection = ConnectionFactory.createConnection(config);
			table = connection.getTable(TableName.valueOf(tenantId+"-"+"Transformations"));
			SingleColumnValueFilter groupIdFilter = new SingleColumnValueFilter(Bytes.toBytes("details"), Bytes.toBytes("groupId"), CompareOp.EQUAL, Bytes.toBytes(deviceId));

			FilterList filterList = new FilterList(FilterList.Operator.MUST_PASS_ALL);
			filterList.addFilter(groupIdFilter);
			filterList.addFilter(new PageFilter(1));

			Scan scan = new Scan();
			scan.setCaching(10000);
			scan.setReversed(true);
			scan.setFilter(filterList);

			resultScanner = table.getScanner(scan);

			for (Result result = resultScanner.next(); result != null; result = resultScanner.next()) {
				Map<String, String> row = new HashMap<String, String>();
				row.put("rowkey", Bytes.toString(result.getRow()));

				for (Cell cell : result.listCells()) {
					
					row.put(Bytes.toString(CellUtil.cloneQualifier(cell)), Bytes.toString(CellUtil.cloneValue(cell)));
				}

				list.add(row);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (table != null) {
					table.close();
				}

				if (resultScanner != null) {
					resultScanner.close();
				}

				if (connection != null) {
					connection.close();
				}
			} catch (Exception e2) {
				e2.printStackTrace();
			}
		}

		return list;
	}

	public List<Map<String, String>> getAnalyzedRecord(String tenantId, String deviceId ) {
		Connection connection = null;
		Table table = null;
		ResultScanner resultScanner = null;
		ResultScanner resultScanner2 = null;

		List<Map<String, String>> list = new ArrayList<Map<String, String>>();	
//		Map<String, List<Map<String, String>>> finalResult = new HashMap<String, List<Map<String, String>>>();

		try {
			connection = ConnectionFactory.createConnection(config);

			if (deviceId.equalsIgnoreCase("batch-analytics")) {
				table = connection.getTable(TableName.valueOf(tenantId+"-Transformations"));
			} else {
				table = connection.getTable(TableName.valueOf(tenantId));
			}

			SingleColumnValueFilter groupIdFilter = new SingleColumnValueFilter(Bytes.toBytes("analytics"), Bytes.toBytes("groupId"), CompareOp.EQUAL, Bytes.toBytes(deviceId));

			FilterList filterList = new FilterList(FilterList.Operator.MUST_PASS_ALL);
			filterList.addFilter(groupIdFilter);
			filterList.addFilter(new PageFilter(1000));

			Scan scan = new Scan();
			scan.setCaching(10000);
			scan.setReversed(true);
			scan.setFilter(filterList);

			resultScanner = table.getScanner(scan);
			
            resultScanner2 = table.getScanner(scan);

			Set<String> setValue = new HashSet<String>();
			SimpleDateFormat dateFormat = new SimpleDateFormat("kk:mm:ss");

			String flag = ""; 
			for (Result result = resultScanner2.next(); result != null;) {
				flag = Bytes.toString(result.getRow()).split("_")[0];
				break;
			}
			
			for (Result result = resultScanner.next(); result != null; result = resultScanner.next()) {
				Map<String, String> row =new HashMap<String, String>();
				
				String _rowKey = Bytes.toString(result.getRow());
				row.put("rowkey", _rowKey);
				if ( !_rowKey.split("_")[0].toString().equals(flag)){
					break;
			      }
				
				for (Cell cell : result.listCells()) {
					setValue.add((Bytes.toString(CellUtil.cloneQualifier(cell))));
					row.put(Bytes.toString(CellUtil.cloneQualifier(cell)), Bytes.toString(CellUtil.cloneValue(cell)));
					row.put("date", dateFormat.format(new Date(Long.parseLong(row.get("rowkey").split("_")[0]))));
				}
				
				list.add(row);
			}

			Collections.reverse(list);
			System.out.println("list---------------"+list.toString());
			System.out.println("set------------------"+setValue.toString());

//			for (String key : setValue) {
//				for (Map<String, String> map : list) {
//					if (map.containsKey(key)) {
//						List<Map<String, String>> resultList = finalResult.get(key);
//
//						if (resultList == null) {
//							resultList = new ArrayList<Map<String, String>>();
//						}
//
//						Map<String, String> mapValue = new HashMap<String, String>();
////						mapValue.put("value", map.get(key));
//						mapValue.putAll(map);
//						mapValue.put("date", dateFormat.format(new Date(Long.parseLong(map.get("rowkey").split("_")[0]))));
//						resultList.add(mapValue);
//
//						finalResult.put(key, resultList);
//					}
//				}
//			}
		} catch (Exception e) {	
			e.printStackTrace();
		} finally {
			try {
				if (table != null) {
					table.close();
				}

				if (resultScanner != null) {
					resultScanner.close();
				}

				if (connection != null) {
					connection.close();
				}
			} catch (Exception e2) {
				e2.printStackTrace();
			}
		}
		
		return list;
	}
}
	