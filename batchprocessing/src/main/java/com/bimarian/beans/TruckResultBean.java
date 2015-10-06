package com.bimarian.beans;

import java.io.Serializable;

public class TruckResultBean implements Serializable {
	
	private static final long serialVersionUID = 825812727284646218L;
	
	private String VNo;
	private Long count;
	
	/**
	 * @return the vNo
	 */
	public String getVNo() {
		return VNo;
	}
	/**
	 * @param vNo the vNo to set
	 */
	public void setVNo(String VNo) {
		this.VNo = VNo;
	}
	/**
	 * @return the count
	 */
	public Long getCount() {
		return count;
	}
	/**
	 * @param count the count to set
	 */
	public void setCount(Long count) {
		this.count = count;
	}
		
	@Override
	public String toString() {
		return VNo + "," + count;
	}
}
