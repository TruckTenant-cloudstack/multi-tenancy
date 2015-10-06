#! /bin/bash

#
## Script to run the FogHorn cloud stack platform end-to-end for POC:
## 1. Read the tenants information from the configuration file.
## 2. Create Kafka topic for each tenant.
## 3. Create Hbase tables for each tenant.
## 4. Create Flume agent configuration file for each tenant to take data from a configurable number of channels.
## 5. Start/stop/restart flume agents for each tenant. 
## 6. Start/stop/restart apache server and Jetty server.
## 7. Start/stop/restart Sparkstreaming service. 
#

BASE_DIR=`dirname $0`
CONFIG=$BASE_DIR/tenants.cfg
FLUME_DIR=$BASE_DIR/flume
kafkaBrokersList=192.168.56.101:9092
cmd="$0"
channels=$2

if [ -z "$channels" ]; then
    channels=2
fi

if [ ! -f $CONFIG ]; then
    echo "$CONFIG file does not exist, skip the execution."
    exit 1
fi

if [ ! -d $FLUME_DIR ]; then
    mkdir -p $FLUME_DIR
fi

tenants=`grep "^tenants" $CONFIG | cut -d'=' -f2`
tenantsList=${tenants//','/' '}
tenantsList=`echo $tenantsList | sed -e 's/^[\t]//'`

if [ -z "$tenantsList" ]; then 
    echo "Tenant names not found in the provided config file: $CONFIG"
   exit 1
fi

function createTopic()
{
    tenantName=$1
    /root/kafka_2.10-0.8.2.0/bin/kafka-topics.sh --list --zookeeper 127.0.0.1:2181 | grep "^$tenantName$" > /dev/null
    res=$?
    if [ $res -eq 1 ]; then
        topicname=`/root/kafka_2.10-0.8.2.0/bin/kafka-topics.sh --create --zookeeper 127.0.0.1:2181 --replication-factor 3 --partitions 1 --topic $tenantName`
       st=$?
       if [ $st -eq 0 ]; then
           echo "Topic created successfully: $tenantName"
       else 
           echo "Topic creation is failed for $tenantName, Skipping the execution."
           exit 1;
       fi 
    else
       echo "Topic already created in Kafka: $tenantName"
    fi
}

function deleteTopic()
{
    tenantName=$1
    /root/kafka_2.10-0.8.2.0/bin/kafka-topics.sh --list --zookeeper 127.0.0.1:2181 | grep "^$tenantName$" > /dev/null
    res=$?
    if [ $res -eq 0 ]; then
     /root/kafka_2.10-0.8.2.0/bin/kafka-topics.sh --delete --zookeeper 127.0.0.1:2181 --topic $tenantName
       st=$?
       if [ $st -eq 0 ]; then
           echo "Topic deleted successfully: $tenantName"
       else
           echo "Topic deletion is failed for $tenantName, Skipping the execution."
           exit 1;
       fi
    else
       echo "Topic not exist in Kafka: $tenantName"
    fi
}

function createFlumeAgent()
{
    tenantName=$1
    agent_config_file=$FLUME_DIR/$tenantName.conf

    for i in `seq 1 $channels`
    do
    	sources="$sources so$i"
    done
    echo -e "$tenantName.sources =$sources\n$tenantName.channels = ch1\n$tenantName.sinks = si1" > $agent_config_file

    for i in `seq 1 $channels`
    do
        echo -e "\n$tenantName.sources.so$i.type = exec\n$tenantName.sources.so$i.shell = /bin/bash -c\n$tenantName.sources.so$i.command = /opt/truck/event_generator_Time.sh $tenantName $i\n$tenantName.sources.so$i.batchSize = 1\n$tenantName.sources.so$i.channels = ch1" >> $agent_config_file
    done
    
    echo -e "\n\n$tenantName.channels.ch1.type = memory\n$tenantName.channels.ch1.capacity = 10000\n$tenantName.channels.ch1.transactionCapacity = 1000\n\n$tenantName.sinks.si1.type = org.apache.flume.sink.kafka.KafkaSink\n$tenantName.sinks.si1.topic = $tenantName\n$tenantName.sinks.si1.brokerList = $kafkaBrokersList\n$tenantName.sinks.si1.channel = ch1\n$tenantName.sinks.si1.batchSize = 1" >> $agent_config_file
}

function createHbaseTables()
{
    tenantName=$1
    echo "describe '$tenantName'" | hbase shell -n > /dev/null 2>&1
    status=$?
    if [ $status -eq 1 ]; then
       echo -e "create '$tenantName','details'\ncreate '$tenantName-Transformations','analytics'" | hbase shell -n > /dev/null 2>&1
    elif [ $status -eq 0 ]; then
       echo "Hbase Tables already created for the Tenant: $tenantName"
    fi
}

function deleteHbaseTables()
{
    tenantName=$1
    echo "describe \"$tenantName\"" | hbase shell -n > /dev/null 2>&1
    status=$?
    if [ $status -eq 0 ]; then
       echo -e "disable '$tenantName'\ndrop '$tenantName'\ndisable '$tenantName-Transformations'\ndrop '$tenantName-Transformations'\ndisable '$tenantName-SparkSQL'\ndrop '$tenantName-SparkSQL'" | hbase shell -n > /dev/null 2>&1
    elif [ $status -ne 0 ]; then
        echo "Hbase tables does not exist for the Tenant: $tenantName"
    fi
}

function startFlumeAgent()
{
    tenantName=$1
    flume-ng agent --conf conf --conf-file $FLUME_DIR/$tenantName.conf --name $tenantName -Dflume.root.logger=INFO,console > $FLUME_DIR/$tenantName.log 2>&1 &
    res=$?
    if [ $res -eq 0 ]; then
        echo  "Flume agent started for the tenant: $tenantName"
        echo "Please run below command to see the events from this tenant Kafka Topic:"
        echo "	/root/kafka_2.10-0.8.2.0/bin/kafka-console-consumer.sh --zookeeper 127.0.0.1:2181 --topic $tenantName"
    else
        echo "Flume agent start is failed for the tenant: $tenantName, Skipping the execution."
        exit 1;
    fi
}

function stopFlumeAgents()
{
    pids=`ps -ef | grep -i "flume-ng" | grep -v "grep" | awk '{ printf $2" " }'`
    if [ ! -z "$pids" ]; then
        kill -9 $pids
        rm -f $FLUME_DIR/* > /dev/null
        echo "Successfully stopped flume agents of all tenants: OK"
    else
        echo "Flume agents are not running for any tenant"
    fi      
}

function getFlumeAgentsStatus()
{
    pids=`ps -ef | grep -i "flume-ng" | grep -v "grep" | awk '{ printf $2" " }'`
    if [ ! -z "$pids" ]; then
        echo "Flume agents are running for each tenant"
    else
        echo "Flume agents are not running for any tenant"
    fi
}

function do_start()
{
    service sparkstreaming stop
    stopFlumeAgents
    for tenant in $tenantsList
    do
        createTopic $tenant
        createHbaseTables $tenant
        createFlumeAgent $tenant
        startFlumeAgent $tenant
     done
     service sparkstreaming start
     #service apache2 start
     service jetty start
}

function do_stop()
{
    service sparkstreaming stop
    stopFlumeAgents
    #service apache2 stop
    service jetty stop
}

function do_cleanup()
{
    do_stop;
    for tenant in $tenantsList
    do
        deleteTopic $tenant
        deleteHbaseTables $tenant
    done    
}

function do_status()
{
    echo "Flume agents status:"
    echo "********************"
    getFlumeAgentsStatus;    
    echo -e "**************************************************************\n"

    echo "SparkStreaming job status:"
    echo "**************************"
    service sparkstreaming status
    echo -e "**************************************************************\n"

    #echo "Apache server status:"    
    #echo "*********************"
    #service apache2 status
    echo -e "**************************************************************\n"

    echo "Jetty server status:"
    echo "********************"
    service jetty status
    echo -e "**************************************************************"
}

case "$1" in
 start)
   do_start;
   ;;
 stop)
   do_stop;
   ;;
 status)
   do_status;
   ;;
 restart)
   do_stop;
   do_start;  
   ;;
 cleanup)
   do_cleanup;
   ;;
 *)
   echo "Usage: $cmd {start|stop|restart|status|cleanup}";
   echo -e "Example: \n $cmd <start> <number_of_channels> [Default: 2](number_of_channels to be used in creation of flume agent configuration file for each tenant)"
   exit 1
   ;;
esac
