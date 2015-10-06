// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ freeboard.io-highcharts                                            │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2014 Hugo Sequeira (https://github.com/hugocore)       │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Freeboard widget plugin for Highcharts.                            │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {

	//
	// DECLARATIONS
	//
	var HIGHCHARTS_ID = 0;
	var ONE_SECOND_IN_MILIS = 1000;
	var MAX_NUM_SERIES = 3;

	//
	// HELPERS
	//

	// Get coordinates of point
	function xy(obj, x, y) {
		return [ obj[x], obj[y] ]
	}

	// Get label between double quotes
	function getDatasourceName(str) {
		var ret = "";
		if (/"/.test(str)) {
			ret = str.match(/"(.*?)"/)[1];
		} else {
			ret = str;
		}
		return ret;
	}
	
	

	//
	// TIME SERIES CHARTS
	//
	var highchartsLineWidgetSettings = [
			{
				"name" : "timeframe",
				"display_name" : "Timeframe (s)",
				"type" : "text",
				"description" : "Specify the last number of seconds you want to see.",
				"default_value" : 60
			},
			{
				"name" : "blocks",
				"display_name" : "Height (No. Blocks)",
				"type" : "text",
				"default_value" : 4
			},
			{
				"name" : "title",
				"display_name" : "Title",
				"type" : "text"
			}
			 ];

	for (i = 1; i <= MAX_NUM_SERIES; i++) {
		var dataSource = {
			"name" : "series" + i,
			"display_name" : "Series " + i + " - Datasource",
			"type" : "calculated"
		};

		var xField = {
			"name" : "series" + i + "X",
			"display_name" : "Series " + i + " - X Field Name",
			"type" : "text"
		};

		var yField = {
			"name" : "series" + i + "Y",
			"display_name" : "Series " + i + " - Y Field Name",
			"type" : "text"
		};
		highchartsLineWidgetSettings.push(dataSource);
		highchartsLineWidgetSettings.push(xField);
		highchartsLineWidgetSettings.push(yField);
	}

	freeboard
			.loadWidgetPlugin({
				"type_name" : "highcharts-timeseries",
				"display_name" : "Time series (Highcharts)",
				"description" : "Time series line chart.",
				"external_scripts" : [
						"http://code.highcharts.com/highcharts.js",
						"http://code.highcharts.com/modules/exporting.js",
						"js/freeboard/plugins/plugin_highcharts_theme.js" ],
				"fill_size" : true,
				"settings" : highchartsLineWidgetSettings,
				newInstance : function(settings, newInstanceCallback) {
					newInstanceCallback(new highchartsTimeseriesWidgetPlugin(
							settings));
				}
			});

	var highchartsTimeseriesWidgetPlugin = function(settings) {

		var self = this;
		var currentSettings = settings;

		var thisWidgetId = "highcharts-widget-timeseries-" + HIGHCHARTS_ID++;
		var thisWidgetContainer = $('<div class="highcharts-widget" id="'
				+ thisWidgetId + '"></div>');

		function createWidget() {

			// Get widget configurations
			//var thisWidgetXAxis = JSON.parse(currentSettings.xaxis);
			//var thisWidgetYAxis = JSON.parse(currentSettings.yaxis);
			var thisWidgetTitle = currentSettings.title;
			var thisWidgetSeries = [];

			for (i = 1; i <= MAX_NUM_SERIES; i++) {
				var datasource = currentSettings['series' + i];
				if (datasource) {
					var label = getDatasourceName(datasource);
					var newSeries = {
						id : 'series' + i,
						name : label,
						data : [],
						color: "#3dbdec",
						connectNulls : true
					};
					thisWidgetSeries.push(newSeries);
				}
			}
			// Create widget
			thisWidgetContainer
					.css('height', 60 * self.getHeight() - 10 + 'px');
			thisWidgetContainer.css('width', '100%');
			thisWidgetContainer.highcharts({
				chart : {
					type : 'spline',
					animation : Highcharts.svg,
					marginRight : 10,
					width: 600
				},
				title : {
					text : thisWidgetTitle
				},
				xAxis: {
            type: 'datetime',
            tickPixelInterval: 100,
            maxZoom: 10 * 1000,
			labels: {
	style: {
		color: '#333333',
		fontSize:'11px'
	}
}
        },
				yAxis: {
            minPadding: 0.2,
            maxPadding: 0.2,
            title: {
                text: 'Value'
            },
			labels: {
	style: {
		color: '#333333',
		fontSize:'11px'
	}
}
        },
				legend: {
                enabled: false
            },
			credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
				tooltip : {
					formatter : function() {
						return '<b>'
								+ this.series.name
								+ '</b><br/>'
								+ Highcharts.dateFormat('%H:%M:%S',this.x) + '<br/>'
								+ Highcharts.numberFormat(this.y, 2);
					}
				},
				series : thisWidgetSeries
			});
		}

		self.render = function(containerElement) {
			$(containerElement).append(thisWidgetContainer);
			createWidget();
		}

		self.getHeight = function() {
			return currentSettings.blocks;
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			createWidget();
		}

		self.onCalculatedValueChanged = function(settingName, newValue) {
		console.log(newValue);
		console.log(settingName);
			var chart = thisWidgetContainer.highcharts();
			var series = chart.get(settingName);
			if (series) {
				var timeframeMS = currentSettings.timeframe*ONE_SECOND_IN_MILIS;
				var seriesno = settingName;
				var len = series.data.length;
				var shift = false;
				
				// Check if it should shift the series
				if (series.data.length > 10) {
					var first = series.data[0].x;
					//var last = series.data[series.data.length-1].x;
					var last = new Date().getTime();
					// Check if time frame is complete
					if (last-first>timeframeMS) {
						shift = true;
					}
				}
				
				//series.addPoint(xy(newValue,[ currentSettings[seriesno + "X"] ],[ currentSettings[seriesno + "Y"] ]), true, shift, true);
				series.addPoint(newValue, true, shift, true);
			}
		}

		self.onDispose = function() {
			return;
		}
	}

	//
	// PIE CHARTS
	//

	var highchartsPieWidgetSettings = [ {
		"name" : "blocks",
		"display_name" : "Height Blocks",
		"type" : "text",
		"default_value" : 5
	}, {
		"name" : "title",
		"display_name" : "Title",
		"type" : "text"
	}, {
		"name" : "showLabel",
		"display_name" : "Show Labels",
		"type" : "option",
		"options" : [ {
			"name" : "Yes",
			"value" : true
		}, {
			"name" : "No",
			"value" : false
		} ]
	}, {
		"name" : "showLegend",
		"display_name" : "Show Bottom Legends",
		"type" : "option",
		"options" : [ {
			"name" : "Yes",
			"value" : true
		}, {
			"name" : "No",
			"value" : false
		} ]
	}, {
		"name" : "datasource",
		"display_name" : "Datasource",
		"type" : "calculated"
	}, {
		"name" : "seriesLabel",
		"display_name" : "Label Field Name",
		"type" : "text"
	}, {
		"name" : "seriesValue",
		"display_name" : "Value Field Name",
		"type" : "text"
	} ];

	freeboard.loadWidgetPlugin({
		"type_name" : "highcharts-pie",
		"display_name" : "Pie chart (Highcharts)",
		"description" : "Pie chart with legends.",
		"external_scripts" : [ "http://code.highcharts.com/highcharts.js",
				"http://code.highcharts.com/modules/exporting.js",
				"http://code.highcharts.com/highcharts-more.js",
				"http://code.highcharts.com/modules/solid-gauge.js",
				"js/freeboard/plugins/plugin_highcharts_theme.js" ],
		"fill_size" : true,
		"settings" : highchartsPieWidgetSettings,
		newInstance : function(settings, newInstanceCallback) {
			newInstanceCallback(new highchartsPieWidgetPlugin(settings));
		}
	});

	var highchartsPieWidgetPlugin = function(settings) {

		var self = this;
		var currentSettings = settings;

		var thisWidgetId = "highcharts-widget-pie-" + HIGHCHARTS_ID++;
		var thisWidgetContainer = $('<div class="highcharts-widget" id="'
				+ thisWidgetId + '"></div>');

		function createWidget() {

			// Get widget configurations
			var thisWidgetTitle = currentSettings.title;
			var thisWidgetSeries = [];
			var thisWidgetLabels = (currentSettings.showLabel === "true");
			var thisWidgetLegends = (currentSettings.showLegend === "true");

			for (i = 1; i <= MAX_NUM_SERIES; i++) {
				var datasource = currentSettings['series' + i];
				if (datasource) {
					var label = getDatasourceName(datasource);
					var newSeries = {
						id : 'series' + i,
						name : label,
						data : [],
						connectNulls : true
					};
					thisWidgetSeries.push(newSeries);
				}
			}

			// Create widget
			thisWidgetContainer
					.css('height', 60 * self.getHeight() - 10 + 'px');
			thisWidgetContainer.css('width', '100%');

			thisWidgetContainer
					.highcharts({
						chart : {
							plotBackgroundColor : null,
							plotBorderWidth : null,
							plotShadow : false,
							margin : 40
						},
						title : {
							text : thisWidgetTitle
						},
						pane: {
            size: '100%',
            center: [null, '48%'],
            startAngle: -90,
            endAngle: 270,
            background: {
                innerRadius: '80%',
                outerRadius: '100%',
                shape: 'arc',
                borderColor: 'transparent',
                backgroundColor:'#e8e8e8'
            }
        },
						tooltip : {
							pointFormat : '<b>{point.percentage:.1f}%</b>'
						},
						plotOptions: {
            solidgauge: {
                innerRadius: '80%',
                dataLabels: {
                    y: -30,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        },
		yAxis: {
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: false,
            tickWidth: 0,
            title: {
                y: -70
            },
            labels: {
                y: 16
            }
        },
						legend : {
							enabled : thisWidgetLegends
						},
						series : [ {
							id : 'series',
							type : 'solidgauge',
							data : [ [ 'Loading...', 100 ] ]
						} ]
					});
		}

		self.render = function(containerElement) {
			$(containerElement).append(thisWidgetContainer);
			createWidget();
		}

		self.getHeight = function() {
			return currentSettings.blocks;
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			createWidget();
		}

		self.onCalculatedValueChanged = function(settingName, newValue) {

			var chart = thisWidgetContainer.highcharts();
			var series = chart.get('series');

			if (series && newValue instanceof Array) {
				var data = [];
				var labelField = currentSettings.seriesLabel;
				var valueField = currentSettings.seriesValue;
				if (!_.isUndefined(labelField) && !_.isUndefined(valueField)) {
					_.each(newValue, function(ranking) {
						data.push(xy(ranking, labelField, valueField));
					});
				}
				var redraw = true;
				var animation = true;
				var updatePoints = true;
				series.setData(data, redraw, animation, updatePoints);
			}

		}

		self.onDispose = function() {
			return;
		}
	}
	
	
	//Column chart plugin

	var highchartsBarWidgetSettings = [ 
	{
        "name": "title",
        "display_name": "Title",
        "default_value": "",
        "description": "Title for the chart"
      }, 
	{
        "name": "id",
        "display_name": "id",
        "default_value": "chart1",
        "description": "dom element id of the chart (must be unique for multiple charts)"
      },        
      {
        "name": "data",
        "display_name": "Chart Data",
        "type": "calculated",
        "description": "The data to plot"
      },
      {
        "name": "chartHeight",
        "display_name": "Chart Height (px)",
        "type": "number",
        "default_value": 500,
        "description": "chart height in pixels"
      },
      {
        "name": "chartWidth",
        "display_name": "Chart Widgth (px)",
        "type": "number",
        "default_value": 700,
        "description": "chart width in pixels"
      },      
      {
        "name": "height",
        "display_name": "Height Blocks",
        "type": "number",
        "default_value": 5,
        "description": "A height block is around 60 pixels"
      } ];

	freeboard.loadWidgetPlugin({
		"type_name" : "highcharts-bar",
		"display_name" : "Bar chart (Highcharts)",
		"description" : "Bar chart with legends.",
		"external_scripts" : [ "http://code.highcharts.com/highcharts.js",
				"http://code.highcharts.com/modules/exporting.js",
				"js/freeboard/plugins/plugin_highcharts_theme.js" ],
		"fill_size" : true,
		"settings" : highchartsBarWidgetSettings,
		newInstance : function(settings, newInstanceCallback) {
			newInstanceCallback(new highchartsBarWidgetPlugin(settings));
		}
	});

	var highchartsBarWidgetPlugin = function(settings) {

		var self = this;
		var currentSettings = settings;

		var thisWidgetId = "highcharts-widget-bar-" + HIGHCHARTS_ID++;
		var thisWidgetContainer = $('<div class="highcharts-widget" id="'
				+ thisWidgetId + '"></div>');

		function createWidget() {

			// Get widget configurations
			var thisWidgetTitle = currentSettings.title;
			var thisWidgetSeries = [];
			
			// Create widget
			thisWidgetContainer
					.css('height', 60 * self.getHeight() - 10 + 'px');
			thisWidgetContainer.css('width', '100%');

			thisWidgetContainer
					.highcharts({
						chart : {							
							width: 600
						},
						title : {
							text : thisWidgetTitle
						},						
						xAxis: {
						
            categories: [],
labels: {
	style: {
		color: '#333333',
		fontSize:'12px'
	}
}			
        },
        yAxis: {
		min:0,
			max: 50,
			tickInterval: 5,
            title: {
                text: 'Count'
            },
			labels: {
	style: {
		color: '#333333',
		fontSize:'13px'
	}
}
        },
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		exporting: {
                enabled: false
            },
        tooltip: {
            formatter: function () {
                return this.series.name + ': ' + this.y;
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal'                
            }
        },
						series : [ {
							id : 'series',
							type : 'column',
							color: "#3dbdec",
							name:"Count",
							data: []
						} ]
					});
		}

		self.render = function(containerElement) {
			$(containerElement).append(thisWidgetContainer);
			createWidget();
		}

		self.getHeight = function() {
			return currentSettings.height;
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			createWidget();
		}

		self.onCalculatedValueChanged = function(settingName, newValue) {

			var chart = thisWidgetContainer.highcharts();
			var series = chart.get('series');

			var data = [];
			console.log(newValue);
			series.setData(newValue);
			}

		self.onDispose = function() {
			return;
		}
	}
	
	
	//Solid guages
	
	var highchartsSGWidgetSettings = [ 
	{
        "name": "title",
        "display_name": "Title",
        "default_value": "",
        "description": "Title for the chart"
      }, 
	{
        "name": "id",
        "display_name": "id",
        "default_value": "chart1",
        "description": "dom element id of the chart (must be unique for multiple charts)"
      },        
      {
        "name": "data",
        "display_name": "Chart Data",
        "type": "calculated",
        "description": "The data to plot"
      },
	  {
        "name": "minvalue",
        "display_name": "MIN VALUE",
        "type": "number",
        "description": "min values"
      },
	  {
        "name": "maxvalue",
        "display_name": "MAX VALUE",
        "type": "number",
        "description": "max values"
      },
	  {
        "name": "valueSuffix",
        "display_name": "Value Suffix",
        "type": "text",
        "description": "suffix values"
      },
      {
        "name": "chartHeight",
        "display_name": "Chart Height (px)",
        "type": "number",
        "default_value": 500,
        "description": "chart height in pixels"
      },
      {
        "name": "chartWidth",
        "display_name": "Chart Widgth (px)",
        "type": "number",
        "default_value": 700,
        "description": "chart width in pixels"
      },      
      {
        "name": "height",
        "display_name": "Height Blocks",
        "type": "number",
        "default_value": 5,
        "description": "A height block is around 60 pixels"
      } ];

	freeboard.loadWidgetPlugin({
		"type_name" : "highcharts-solidGauge",
		"display_name" : "Solid Guage (Highcharts)",
		"description" : "Solid Guages.",
		"external_scripts" : [ "http://code.highcharts.com/highcharts.js",
				"http://code.highcharts.com/modules/exporting.js",
				"http://code.highcharts.com/highcharts-more.js",
				"http://code.highcharts.com/modules/solid-gauge.js",
				"js/freeboard/plugins/plugin_highcharts_theme.js" ],
		"fill_size" : true,
		"settings" : highchartsSGWidgetSettings,
		newInstance : function(settings, newInstanceCallback) {
			newInstanceCallback(new highchartsSGWidgetPlugin(settings));
		}
	});

	var highchartsSGWidgetPlugin = function(settings) {

		var self = this;
		var currentSettings = settings;

		var thisWidgetId = "highcharts-widget-sg-" + HIGHCHARTS_ID++;
		var thisWidgetContainer = $('<div class="highcharts-widget" id="'
				+ thisWidgetId + '"></div>');

		function createWidget() {

			// Get widget configurations
			var thisWidgetTitle = currentSettings.title;
			var thisWidgetSeries = [];
			
			// Create widget
			thisWidgetContainer
					.css('height', 60 * self.getHeight() - 10 + 'px');
			thisWidgetContainer.css('width', '100%');

			thisWidgetContainer
					.highcharts({
						chart : {
							animation: {
								duration: 800
							}
						},
						title : {
							text : thisWidgetTitle
						},						
						pane: {
							size: '100%',
							center: [null, '48%'],
							startAngle: -90,
							endAngle: 270,
							background: {
								innerRadius: '80%',
								outerRadius: '100%',
								shape: 'arc',
								borderColor: 'transparent',
								backgroundColor:'#e8e8e8'
							}
						},
						tooltip: {
							enabled: false
						},
						yAxis: {
							min: currentSettings.minvalue,
							max: currentSettings.maxvalue,
							minColor:'#3dbdec',
							maxColor:'#3dbdec',
							lineWidth: 0,
							minorTickInterval: null,
							tickPixelInterval: false,
							tickWidth: 0,
							title: {
								y: -70
							},
							labels: {
								y: 16
							}
						},
						credits: {
							enabled: false
						},
						legend: {
							enabled: false
						},
						exporting: {
								enabled: false
						},
						plotOptions: {
            solidgauge: {
                innerRadius: '80%',
                dataLabels: {
                    y: -30,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        },
						series : [ {
							id : 'sguage',
							type : 'solidgauge',
							data: [],
							dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' +
                       '<span style="font-size:12px;color:black">'+currentSettings.valueSuffix+'</span></div>'
            }
						} ]
					});
		}

		self.render = function(containerElement) {
			$(containerElement).append(thisWidgetContainer);
			createWidget();
		}

		self.getHeight = function() {
			return currentSettings.height;
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			createWidget();
		}

		self.onCalculatedValueChanged = function(settingName, newValue) {
			var chart = thisWidgetContainer.highcharts();
			var sguage = chart.get('sguage');
			var sdata = [];
			sdata.push(parseInt(newValue));
			//console.log(sdata);
			sguage.setData(sdata);
			}

		self.onDispose = function() {
			return;
		}
	}
	
	//Line chart
	
	var highchartsLineWidgetSettings = [ 
	{
        "name": "title",
        "display_name": "Title",
        "default_value": "",
        "description": "Title for the chart"
      }, 
	{
        "name": "id",
        "display_name": "id",
        "default_value": "chart1",
        "description": "dom element id of the chart (must be unique for multiple charts)"
      },        
      {
        "name": "data",
        "display_name": "Chart Data",
        "type": "calculated",
        "description": "The data to plot"
      },
      {
        "name": "chartHeight",
        "display_name": "Chart Height (px)",
        "type": "number",
        "default_value": 500,
        "description": "chart height in pixels"
      },
      {
        "name": "chartWidth",
        "display_name": "Chart Widgth (px)",
        "type": "number",
        "default_value": 700,
        "description": "chart width in pixels"
      },      
      {
        "name": "height",
        "display_name": "Height Blocks",
        "type": "number",
        "default_value": 5,
        "description": "A height block is around 60 pixels"
      } ];

	freeboard.loadWidgetPlugin({
		"type_name" : "highcharts-Line",
		"display_name" : "Line Graph (Highcharts)",
		"description" : "Basic line graph",
		"external_scripts" : [ "http://code.highcharts.com/highcharts.js",
				"http://code.highcharts.com/modules/exporting.js",
				"js/freeboard/plugins/plugin_highcharts_theme.js" ],
		"fill_size" : true,
		"settings" : highchartsLineWidgetSettings,
		newInstance : function(settings, newInstanceCallback) {
			newInstanceCallback(new highchartsLineWidgetPlugin(settings));
		}
	});

	var highchartsLineWidgetPlugin = function(settings) {

		var self = this;
		var currentSettings = settings;

		var thisWidgetId = "highcharts-widget-sg-" + HIGHCHARTS_ID++;
		var thisWidgetContainer = $('<div class="highcharts-widget" id="'
				+ thisWidgetId + '"></div>');

		function createWidget() {

			// Get widget configurations
			var thisWidgetTitle = currentSettings.title;
			var thisWidgetSeries = [];
			
			// Create widget
			thisWidgetContainer
					.css('height', 60 * self.getHeight() - 10 + 'px');
			thisWidgetContainer.css('width', '100%');

			thisWidgetContainer
					.highcharts({
        chart: {
		renderTo: 'lineplot',
            zoomType: 'x',
			events: {
            load: requestData
        }
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            //minRange: 90 * 24 * 3600000 // fourteen days
        },
        yAxis: {
            title: {
                text: 'Logmar Values'
            }
        },
        legend: {
            enabled: false
        },
		credits: {
		enabled: false
		},
		exporting: {
			enabled: false
		},
        plotOptions: {
            line: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 3,
					enabled:true
                },
                lineWidth: 2,
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'line',
            name: 'Logmar Value',
            pointInterval: 24 * 3600 * 1000,
            pointStart: Date.UTC(2006, 0, 1),
            data: []
        }]
					});
		}

		self.render = function(containerElement) {
			$(containerElement).append(thisWidgetContainer);
			createWidget();
		}

		self.getHeight = function() {
			return currentSettings.height;
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			createWidget();
		}

		self.onCalculatedValueChanged = function(settingName, newValue) {
			var chart = thisWidgetContainer.highcharts();
			var series = chart.get('series');

			var data = [];
			_.each(newValue, function(ranking) {
				data.push([ranking[0],parseInt(ranking[1])]);
			});
			series.setData(data);
			}

		self.onDispose = function() {
			return;
		}
	}
	

}());