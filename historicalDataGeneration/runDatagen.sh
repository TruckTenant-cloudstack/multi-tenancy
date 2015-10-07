#! /bin/bash

i=1
while read nextline
   do
       orginTravelDate=`echo $nextline| sed -e 's/\"//g'`
	java -jar -DTripNo="VRL_$i" -DTenant="VRL Services" -DVehicleNo=12060100122 -DTravelDate="$orginTravelDate" -DFrom=Hyderabad -DTo=Vijayawada route-map-simulator-2.0.jar >> datagen0910_vrl_service_12060100122_6MONdata_hyd_Vijayawada_linux.json
    let i+=1
   done < /root/TruckTenant-cloudstack/multi-tenancy/historicalDataGeneration/dates.txt

