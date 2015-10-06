package com.bimarian.main;

import java.io.Serializable;

import scala.Tuple2;

import com.bimarian.beans.TruckDeviceBean;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * FilterEvents program filters event stream based on tenant's name
 */
public class FilterEvents implements Serializable {

	private static final long serialVersionUID = -1880571850065816370L;

	public TruckDeviceBean truckEventsFilter(Tuple2<String, String> tuple2) {
		String jsonData = tuple2._2();
		boolean retVal = true;
		for (String tenant : TenantHandler.tenantNames) {
			if (jsonData.contains(tenant)) {
				retVal = false;
				break;
			}
		}
		
		if (jsonData.contains("VRL") || (retVal && (TenantHandler.defaultTenant.equals("VRL")))) {
			Gson gson = new GsonBuilder().setDateFormat("yyyy/MM/dd'T'HH:mm:ss+0530").create();
			TruckDeviceBean model = gson.fromJson(jsonData.trim(), TruckDeviceBean.class);
			return model;
		} else {
			return null;
		}
	}
}
