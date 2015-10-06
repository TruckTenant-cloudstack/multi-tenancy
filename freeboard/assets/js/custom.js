var chart; 
function requestData() 
{
    $.ajax({
    url: "http://192.168.1.38:8080/vizzario-rest/service/getAcutiyDataByHour",
	type: "GET",
	dataType: 'json',
    success: function(series) 
    {
		var yearArr = [];
		var len1 = series.length;
		for(var i=0;i<len1;i++) {
			var c = [series[i].timeInMillies, series[i].aggregatedValue];
			yearArr.push(c);
		}
		yearArr.sort();
		chart.series[0].setData(yearArr);
    },      
    });
}

$(function () {

    chart = new Highcharts.Chart({
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
});