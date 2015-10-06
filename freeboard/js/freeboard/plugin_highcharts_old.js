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
var clrArr = ['#3dbdec','#3dbdec','#aa4999','#bbcd41'];
var srsArr = ['X','X','Y','Z'];

			for (i = 1; i <= MAX_NUM_SERIES; i++) {
				var datasource = currentSettings['series' + i];
				if (datasource) {
					var label = getDatasourceName(datasource);
					var newSeries = {
						id : 'series' + i,
						name : srsArr[i],
						data : [],
						color: clrArr[i],
						connectNulls : true
					};
					thisWidgetSeries.push(newSeries);
				}
			}
			//alert(thisWidgetSeries);
			// Create widget
			thisWidgetContainer
					.css('height', 60 * self.getHeight() - 10 + 'px');
			thisWidgetContainer.css('width', '100%');
			thisWidgetContainer.highcharts({
				chart : {
					type : 'spline',
					animation : Highcharts.svg,
					width : 600
				},
				title : {
					text : thisWidgetTitle
				},
				xAxis: {
            type: 'datetime',
            tickPixelInterval: 100,
            maxZoom: 10*1000,
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
				if (series.data.length > 1) {
					var first = series.data[0].x;
					var last = series.data[series.data.length-1].x;
					//var last = new Date().getTime();
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
							marginRight: 0,
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
			max: 20,
			tickInterval: 5,
            title: {
                text: 'MPC'
            },
			labels: {
	style: {
		color: '#333333',
		fontSize:'12px'
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
                stacking: 'normal',
				pointPadding: 0.1	
            }			
        },
						series : [ {
							id : 'series',
							type : 'column',
							color: "#3dbdec",
							name: 'Speed',
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
			_.each(newValue, function(ranking) {
				data.push([ranking[0],parseInt(ranking[1])]);
			});
			series.setData(data);
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
	
	//Custom Google maps created by bimarian
	
	//freeboard.addStyle('.gm-style-cc a', "text-shadow:none;");
	
	var initializeCallbacks = [];
	window.gmap_initialize = function()
	{
	for(var index = 0; index < initializeCallbacks.length; index++)
	{
	initializeCallbacks[index]();
	}

	initializeCallbacks = [];
	}
	
	head.js("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=gmap_initialize");

    var googleMapWidget = function (settings) {
        var self = this;
var currentSettings = settings;
var map;
var marker;
var poly;
var currentPosition = {};
var postUpdateCount = 0;


function addLatLngPoly(position) {
var path = poly.getPath();
path.push(position);
}

function updatePosition()
{
	if(map && marker && currentPosition.lat && currentPosition.lon)
	{
		var newLatLon = new google.maps.LatLng(currentPosition.lat, currentPosition.lon);
		marker.setPosition(newLatLon);

		if(currentSettings.drawPath) addLatLngPoly(newLatLon);
		map.panTo(newLatLon);
	}
}


        this.render = function(element)
		{
			function initializeMap()
			{
				var mapOptions = {
					zoom            : 8,
					//center          : new google.maps.LatLng(-96.7771911621094,43.619176442724),
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					disableDefaultUI: false,
					draggable       : true
				};

				map = new google.maps.Map(element, mapOptions);

var polyOptions = {
    strokeColor: '#f91a03',
    strokeOpacity: 1.0,
    strokeWeight: 3
  };

poly = new google.maps.Polyline(polyOptions);
poly.setMap(map);

				google.maps.event.addDomListener(element, 'mouseenter', function(e)
				{
					e.cancelBubble = true;
					if(!map.hover)
					{
						map.hover = true;
						map.setOptions({zoomControl: true});
					}
				});

				google.maps.event.addDomListener(element, 'mouseleave', function(e)
				{
					if(map.hover)
					{
						map.setOptions({zoomControl: false});
						map.hover = false;
					}
				});

				marker = new google.maps.Marker({map: map});

				updatePosition();
			}

			if(window.google && window.google.maps)
			{
				initializeMap();
			}
			else
			{
				initializeCallbacks.push(initializeMap);
			}
		}

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == "lat") {
                currentPosition.lat = newValue;
            }
            else if (settingName == "lon") {
                currentPosition.lon = newValue;
            }

            postUpdateCount++;

if(postUpdateCount >= 1)
{
postUpdateCount = 0;
updatePosition();
}
        }

        this.onDispose = function () {
        }

        this.getHeight = function () {
            return 4;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "custom_google_map",
        display_name: "Bimarian Google Map",
        fill_size: true,
        settings: [
            {
                name: "lat",
                display_name: "Latitude",
                type: "calculated"
            },
            {
                name: "lon",
                display_name: "Longitude",
                type: "calculated"
            },
			{
			type: "boolean",
			display_name: "Draw Path",
			name :"drawPath"
			}
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new googleMapWidget(settings));
        }
    });

}());