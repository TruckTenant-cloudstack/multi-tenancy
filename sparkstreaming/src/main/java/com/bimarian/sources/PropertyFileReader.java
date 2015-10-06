package com.bimarian.sources;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

/**
 * PropertyFileReader program reads the tenants information from the configuration file.
 */
public class PropertyFileReader {
	
	private static PropertyFileReader instance = null;
	private Properties properties = null;

	private PropertyFileReader(String fileName) {
		try {
			InputStream inputStream = new FileInputStream(new File(fileName));
			properties = new Properties();
			properties.load(inputStream);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static synchronized PropertyFileReader getInstance(String fileName) {
		if (instance == null) {
			instance = new PropertyFileReader(fileName);
		}

		return instance;
	}

	public String getProperty(String key) {
		return properties.getProperty(key);
	}
}
