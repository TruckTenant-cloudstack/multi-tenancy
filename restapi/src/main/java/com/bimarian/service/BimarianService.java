package com.bimarian.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Path("/service")
public class BimarianService {

	private Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();

	@GET
	@Path("/getRecord")
	public Response getRecord(@QueryParam("tenantId") String tenantId, @QueryParam("deviceId") String deviceId) throws IOException {
		BimarianServiceHelper helper = new BimarianServiceHelper();
		List<Map<String, String>> result = helper.getRecord(tenantId, deviceId);
		return Response.status(200).entity(gson.toJson(result)).build();
	}
	
	@GET
	@Path("/getTransformedRecords")
	public Response getTransformedRecords(@QueryParam("recordsCount") int recordsCount, @QueryParam("tenantId") String tenantId, @QueryParam("deviceId") String deviceId) {
		BimarianServiceHelper helper = new BimarianServiceHelper();
		Map<String, List<Map<String, String>>> result = helper.getTransformedRecords(recordsCount, tenantId, deviceId );
		return Response.status(200).entity(gson.toJson(result)).build();
	}
	
	@GET
	@Path("/getTransformedRecord")
	public Response getTransformedRecord(@QueryParam("tenantId") String tenantId, @QueryParam("deviceId") String deviceId) throws IOException {
		BimarianServiceHelper helper = new BimarianServiceHelper();
		List<Map<String, String>> result = helper.getTransformedRecord(tenantId, deviceId);
		return Response.status(200).entity(gson.toJson(result)).build();
	}
	
	@GET
	@Path("/getAnalyzedRecord")
	public Response getAnalyzedRecord(@QueryParam("tenantId") String tenantId, @QueryParam("deviceId") String deviceId) throws IOException {
		BimarianServiceHelper helper = new BimarianServiceHelper();
		List<Map<String, String>> result = helper.getAnalyzedRecord(tenantId, deviceId);				
		return Response.status(200).entity(gson.toJson(result)).build();
	}
}