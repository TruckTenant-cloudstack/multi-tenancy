package com.bimarian.main;

import com.bimarian.beans.TruckDeviceBean;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Test {

	public static void main(String[] args) {
		String input = "{\"TNo\":\"1\",\"VNo\":\"Truck1\",\"groupId\":\"Truck1\",\"deploymentId\":\"VRL\",\"Time\":\"2015/08/31T05:30:15+0530\",\"Acc\": \"off\",\"Lat\":17.387037,\"Lon\":78.486246,\"Speed\": 50,\"Angle\": 285,\"Locate\": \"V\",\"Oil\":498.0,\"Weight\":99.99850219999999,\"Mile\": 0.19076059,\"version\": \"1\",\"timestamp\": \"1441875971559\",\"Location\":\"17.3870369,78.486246\"}";
		
		Gson gson = new GsonBuilder().setDateFormat("yyyy/MM/dd'T'HH:mm:ss+0530").create();
		
		TruckDeviceBean result = gson.fromJson(input, TruckDeviceBean.class);
		System.out.println(result.toString());
	}

}
