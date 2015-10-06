package com.bimarian.beans;

import java.io.Serializable;

public class TruckDeviceBean implements Serializable {
	
	private static final long serialVersionUID = -629893285612253196L;
	
	private String deploymentId;
	private String groupId;
	private String Time;
	private String Acc;
	private String Locate;
	private String timestamp;
	private String Location;
	private double Lat;
	private double Lon;
	private double Speed;
	private double Weight;
	private double Oil;
	private double Mile;
	private int Angle;
	private int version;
	private String VNo;
	private int TNo;

	/**
	 * @return the deploymentId
	 */
	public String getDeploymentId() {
		return deploymentId;
	}
	/**
	 * @param deploymentId the deploymentId to set
	 */
	public void setDeploymentId(String deploymentId) {
		this.deploymentId = deploymentId;
	}
	/**
	 * @return the groupId
	 */
	public String getGroupId() {
		return groupId;
	}
	/**
	 * @param groupId the groupId to set
	 */
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	/**
	 * @return the vNo
	 */
	public String getVNo() {
		return VNo;
	}
	/**
	 * @param vNo the vNo to set
	 */
	public void setVNo(String vNo) {
		VNo = vNo;
	}
	/**
	 * @return the time
	 */
	public String getTime() {
		return Time;
	}
	/**
	 * @param time the time to set
	 */
	public void setTime(String time) {
		Time = time;
	}
	/**
	 * @return the acc
	 */
	public String getAcc() {
		return Acc;
	}
	/**
	 * @param acc the acc to set
	 */
	public void setAcc(String acc) {
		Acc = acc;
	}
	/**
	 * @return the lat
	 */
	public double getLat() {
		return Lat;
	}
	/**
	 * @param lat the lat to set
	 */
	public void setLat(double lat) {
		Lat = lat;
	}
	/**
	 * @return the lon
	 */
	public double getLon() {
		return Lon;
	}
	/**
	 * @param lon the lon to set
	 */
	public void setLon(double lon) {
		Lon = lon;
	}
	/**
	 * @return the speed
	 */
	public double getSpeed() {
		return Speed;
	}
	/**
	 * @param speed the speed to set
	 */
	public void setSpeed(double speed) {
		Speed = speed;
	}
	/**
	 * @return the angle
	 */
	public int getAngle() {
		return Angle;
	}
	/**
	 * @param angle the angle to set
	 */
	public void setAngle(int angle) {
		Angle = angle;
	}
	/**
	 * @return the locate
	 */
	public String getLocate() {
		return Locate;
	}
	/**
	 * @param locate the locate to set
	 */
	public void setLocate(String locate) {
		Locate = locate;
	}
	/**
	 * @return the oil
	 */
	public double getOil() {
		return Oil;
	}
	/**
	 * @param oil the oil to set
	 */
	public void setOil(double oil) {
		Oil = oil;
	}
	/**
	 * @return the mile
	 */
	public double getMile() {
		return Mile;
	}
	/**
	 * @param mile the mile to set
	 */
	public void setMile(double mile) {
		Mile = mile;
	}
	/**
	 * @return the version
	 */
	public int getVersion() {
		return version;
	}
	/**
	 * @param version the version to set
	 */
	public void setVersion(int version) {
		this.version = version;
	}
	/**
	 * @return the timestamp
	 */
	public String getTimestamp() {
		return timestamp;
	}
	/**
	 * @param timestamp the timestamp to set
	 */
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}
	/**
	 * @return the location
	 */
	public String getLocation() {
		return Location;
	}
	/**
	 * @param location the location to set
	 */
	public void setLocation(String location) {
		Location = location;
	}
	/**
	 * @return the weight
	 */
	public double getWeight() {
		return Weight;
	}
	/**
	 * @param weight the weight to set
	 */
	public void setWeight(double weight) {
		this.Weight = weight;
	}
	/**
	 * @return the tNo
	 */
	public int getTNo() {
		return TNo;
	}
	/**
	 * @param tNo the tNo to set
	 */
	public void setTNo(int tNo) {
		TNo = tNo;
	}
	
	@Override
	public String toString() {
		return deploymentId + "," + groupId + "," + Time + "," + Acc + "," + Locate + "," + timestamp + "," +
			   Location + "," + Lat + "," + Lon + "," + Speed + "," + Weight + "," + Oil + "," + Mile + "," + 
			   Angle + "," + version + ","+ VNo + "," + TNo;
	}	
}