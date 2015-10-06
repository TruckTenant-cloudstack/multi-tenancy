/* function to generate random color */
function rndcol() {
    return [~~(Math.random()*255), ~~(Math.random()*255), ~~(Math.random()*255)];
}

/* Function convert the string first letter to uppercase */
function ucwords (str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}

var hbase_rest_api_url;
var oozie_rest_api_url;

$(document).ready(function(){
    $("#refname").html("Dashboard");

//for dynamic channels		
    var SupervisorFile="tenants.cfg";
    var CDDL = $("#tenants");

    $.get(SupervisorFile,function(data) {
        var suplist = data.split("\n");
        var myVars=[];
        for (var i=0, len=suplist.length; i<len; i++) {
            rows = suplist[i].split('=');

            if(rows[1]!=undefined) {
                item = {}
                item ["label"] = rows[0];
                item ["value"] = $.trim(rows[1]);

                myVars.push(item);
            }
        }
        /* Displaying the tenant list */
        $.each(myVars, function(idx, obj) {
            if(obj.label=='tenants') {
                var tnts = obj.value;
                var tntlist = tnts.split(",");
                for (var j=0; j<tntlist.length; j++) {
                    CDDL.append("<option value='" + tntlist[j] + "'>" + tntlist[j] + "</option>");
                }
            } else if(obj.label=='HBASE_REST_API_URL') {
                hbase_rest_api_url = obj.value;
            } else if(obj.label=='OOZIE_REST_API_URL') {
                oozie_rest_api_url = obj.value;
            }
        });
    },'text');

});

function dispDevices(channelid) {
    var SupervisorFile="tenants.cfg";
    var PDDL = $("#devices");
    $.get(SupervisorFile,function(data) {
        var suplist = data.split("\n");
        var myVars=[];
        for (var i=0, len=suplist.length; i<len; i++) {
            rows = suplist[i].split('=');
            if(rows[1]!=undefined) {
                item = {}
                item ["label"] = rows[0];
                item ["value"] = $.trim(rows[1]);
                myVars.push(item);
            }
        }
        $.each(myVars, function(idx, obj) {
            if(obj.label==channelid) {
                var devices = obj.value;
                var deviceslist = devices.split(",");
                PDDL.html('');
                PDDL.append('<option value="">Select</option>');
                for (var k=0; k<deviceslist.length; k++) {
                    PDDL.append("<option value='" + deviceslist[k] + "'>" + deviceslist[k] + "</option>");
                }
            }
        });
    },'text');
}

/*
 Function to filter the devices based on the selection
 */
function showLabels() {
    //alert(hbase_rest_api_url);
    var channelval = $('#tenants').val();
    var deviceval = $('#devices').val();
    $("#refname").html("<span style='color: rgb(" + rndcol()+ ")'>"+ucwords(deviceval)+"</span>");

    /* if(channelval=='VRL') {
        $.getJSON('bimarian.json', function(data) {
            var device = data.datasources;
            device.splice(0, 4);
            device.splice(0, 4,
                {
                    "name":"Resource2",
                    "type":"JSON",
                    "settings":{
                        "url":hbase_rest_api_url+"/getRecords?recordsCount=10&tenantId="+channelval+"&deviceId="+deviceval,
                        "use_thingproxy":true,
                        "refresh":5,
                        "method":"GET"
                    }
                },
                {
                    "name":"Resource1",
                    "type":"JSON",
                    "settings":{
                        "url":hbase_rest_api_url+"/getRecord?tenantId="+channelval+"&deviceId="+deviceval,
                        "use_thingproxy":true,
                        "refresh":5,
                        "method":"GET"
                    }
                }
            );
            freeboard.loadDashboard(data, function() {
                freeboard.setEditing(true);
            });
        });
    } */
}


/* Function to create the jobs */
function createJobs() {

    var channelval = $('#tenants').val();
    var qry = $('#query').val();
    var sendData = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>'+
        '<configuration>'+
        '<property>'+
        '<name>user.name</name>'+
        '<value>root</value>'+
        '</property>'+
        '<property>'+
        '<name>nameNode</name>'+
        '<value>hdfs://hadoop1.test.com:8020</value>'+
        '</property>'+
        '<property>'+
        '<name>jobTracker</name>'+
        '<value>hadoop1.test.com:8032</value>'+
        '</property>'+
        '<property>'+
        '<name>master</name>'+
        '<value>local</value>'+
        '</property>'+
        '<property>'+
        '<name>queueName</name>'+
        '<value>default</value>'+
        '</property>'+
        '<property>'+
        '<name>tenant</name>'+
        '<value>'+channelval+'</value>'+
        '</property>'+
        '<property>'+
        '<name>query</name>'+
        '<value>'+qry+'</value>'+
        '</property>'+
        '<property>'+
        '<name>oozieProjectRoot</name>'+
        '<value>batch_analytics</value>'+
        '</property>'+
        '<property>'+
        '<name>oozie.use.system.libpath</name>'+
        '<value>true</value>'+
        '</property>'+
        '<property>'+
        '<name>oozie.wf.application.path</name>'+
        '<value>${nameNode}/user/${user.name}/${oozieProjectRoot}</value>'+
        '</property>'+
        '</configuration>';

    //console.log("Before ajax call");
    $('#loadingmessage').show();
    $.ajax({
        url: oozie_rest_api_url+'/v1/jobs?action=start',
        type: 'POST',
        dataType: 'xml',
        crossDomain: true,
        contentType: "application/xml;charset=UTF-8",
        data: sendData,
        complete: function(response) {
            console.log("response: "+response.responseText);
            var jobid = $.parseJSON(response.responseText).id;
            console.log(jobid);
            $.getJSON(oozie_rest_api_url+'/v1/job/'+jobid, function(resp) {
                //console.log(resp.status);
                if (resp.status == 'RUNNING') {
                    var intevalVar = setInterval(function() {
                        //console.log(new Date());
                        $.getJSON(oozie_rest_api_url+'/v1/job/'+jobid, function(internalResponse) {
                            //console.log("Internal result : " + internalResponse.status);
                            if (internalResponse.status == 'SUCCEEDED') {
                                $('#loadingmessage').hide();
                                clearInterval(intevalVar);

                                 if(channelval=='TruckData') {
                                    $.getJSON('bimarian.json', function(data) {
                                        var device = data.datasources;
                                        device.splice(0, 4);
                                        device.splice(0, 4,
                                            {
                                                "name":"Resource1",
                                                "type":"JSON",
                                                "settings":{
                                                    "url":hbase_rest_api_url+"/getAnalyzedRecord?tenantId=" + channelval + "&deviceId=batch-analytics",
                                                    "use_thingproxy":true,
                                                    "refresh":5,
                                                    "method":"GET"
                                                }
                                            });
                                        console.log("in data: "+data);
                                        freeboard.loadDashboard(data, function() {
                                            freeboard.setEditing(false);
                                        });
                                    });
                                }
                                $('#job_status').html('JOB Status: '+internalResponse.status);
                            }   else if(  internalResponse.status == 'KILLED' || internalResponse.status == 'FAILED'){
                                console.log("in killed");
                                $('#loadingmessage').hide();
                                clearInterval(intevalVar);
                                if(channelval=='TruckData') {
                                    $.getJSON('bimarian_editied.json', function(data) {


                                        var device = data.datasources;
                                        device.splice(0, 4);
                                        device.splice(0, 4,
                                            {
                                                "name":"Resource1",
                                                "type":"JSON",
                                                "settings":{
                                                    "url":" ",
                                                    "use_thingproxy":true,
                                                    "refresh":5,
                                                    "method":"GET"
                                                }
                                            });

                                        console.log("in json data: "+JSON.stringify(data));
                                        freeboard.loadDashboard(data, function() {
                                            freeboard.setEditing(false);
                                        });
                                    });
                                }
                                $('#job_status').html('JOB Status: '+internalResponse.status);
                            }
                        });
                    }, 5000);
                }
            });
        }
    });
    //console.log("After ajax call");
}
	
