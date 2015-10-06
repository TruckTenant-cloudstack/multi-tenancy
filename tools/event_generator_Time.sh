#! /bin/bash

#
## Simulator script to simulate the continuous stream for multiple channels of multiple tenants.              
#

BASE_DIR=`dirname $0`
cmd="$0"

function usage()
{
   echo -e "Usage: $cmd <Tenant_Name> <Channel_Number> [1 or 2 or 3 or etc...] ( To which channel events to be ingested into flume data source. )"
   echo -e "Example 1: $cmd VRL 1" 
   exit 1;
}
if [ $# -lt 2 ] ;then
   usage;
fi

channelId=`expr $2 % 3`
if [ "$channelId" = "0" ] ;then
    channelId='3'
fi

tenantid=':"deploymentId"'
ntenantid=":\"$1\""
tenantdir=$1

if [ ! -d "$BASE_DIR/tenants_data/$tenantdir" ]; then 
   echo "Provided tenants data directory doesn't exist: $BASE_DIR/tenants_data/$tenantdir, Skipping the execution."
   exit 1
elif [  ! -f "$BASE_DIR/tenants_data/$tenantdir/channel$channelId" ]; then
   echo "Provided tenants data directory exists but requested channel data file doesn't exist: $BASE_DIR/tenants_data/$tenantdir/channel$channelId, Skipping the execution."
   exit 1
fi

while true
do 
        while read nextline
        do 
    	    line=`echo $nextline | sed -e 's/^[ \t]*//'`
	    Time=`date +%Y/%m/%dT%T+0530`
	    timestamp=`date +%s%3N`
	    part0=`echo $line | awk -F'"Time":' '{ print $1 }'`
            part0gen="$part0\"Time\":\""$Time"\",\"Acc\":"
	    part00=`echo $line | awk -F'"Acc":' '{ print $2 }'`
	    finaldata=$part0gen$part00
	    line1=`echo $finaldata | sed -e 's/^[ \t]*//'`
            part1=`echo $line1 | awk -F'"timestamp":' '{ print $1 }'`
	    part1gen="$part1\"timestamp\":$timestamp,\"Location\":"
            part2=`echo $line | awk -F'"Location":' '{ print $2 }'`
            if [ "$tenantdir" = "VRL" ]; then
                deviceid="Truck$channelId"
                ndeviceid="Truck$2"
                echo $part1gen$part2 | sed -e "s/$deviceid/$ndeviceid/g" | sed -e "s/$tenantid/$ntenantid/g"
            fi
       
	    sleep 5
        done < $BASE_DIR/tenants_data/$tenantdir/channel$channelId
done
