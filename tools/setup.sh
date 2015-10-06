#! /bin/bash

#
## Script to automate Truck Tenant cloud stack setup:
## Checks the dependency folders existence at cloned repository 
## Install apache server 
## Install Maven 
## Install jetty server
## Foghorn cloud stack tools in proper place
## Deploy freeboard code in apache server 
## Build Hbase Rest API code and deploy war file in jetty server
## Build Sparkstreaming code and deploy jar file in proper place
#

BASE_DIR=`dirname $0`
function dependencyCheck()
{
    if [ -d $BASE_DIR/freeboard -a -d $BASE_DIR/tools -a -d $BASE_DIR/sparkstreaming -a -d $BASE_DIR/restapi -a -d $BASE_DIR/batchprocessing -a -d $BASE_DIR/oozie/batch_analytics]; then    
        echo "Required folders check done successfully." 
    else
        echo "Cloned Github repository may not be the latest code - or - this tool has been moved from the rest of the multi-tenancy folder." 
        exit 1
    fi
}

function installApache()
{
    which apache2 >/dev/null 2>&1
    res=$?
    if [ $res -ne 0 ] ;then 
        apt-get install -y apache2 
        which apache2 >/dev/null 2>&1
        res=$?
        if [ $res -ne 0 ] ;then
            echo "apache2 package was not installed properly, please contact Truck Tenant support." 
            exit 1
        fi
    elif [ $res -eq 0 ]; then
        echo "apache2 package is already installed in this server."
    fi
}

function installJettyServer()
{ 
    which java >/dev/null 2>&1
    if [ $res -eq 1 ] ;then 
        apt-get install -y openjdk-8-jdk 
        which java >/dev/null 2>&1
        res=$?
        if [ $res -ne 0 ] ;then
            echo "java package was not installed properly, please contact Truck Tenant support." 
            exit 1
        fi

    elif [ $res -eq 0 ]; then
        echo "Java is already installed in this server."
    fi

    service jetty status >/dev/null 2>&1
    res=$?
    
    if [ $res -eq 1 -a ! -d /opt/jetty ] ;then 
        tar -xvzf $BASE_DIR/tools/jetty-distribution-9.2.11.v20150529.tar.gz -C /opt
        mv /opt/jetty-distribution-9.2.11.v20150529 /opt/jetty
        useradd -m -r jetty -s /bin/false
        chown -R jetty:jetty /opt/jetty/
        pushd /etc/init.d >/dev/null 2>&1
	ln -s /opt/jetty/bin/jetty.sh jetty
        update-rc.d jetty defaults >/dev/null 2>&1
        popd >/dev/null 2>&1
        echo -e "JETTY_HOME=/opt/jetty\nJETTY_USER=jetty\nJETTY_PORT=8080\nJETTY_HOST=0.0.0.0\nJETTY_LOGS=/opt/jetty/logs/" > /etc/default/jetty
    else
        echo "Jetty server is already installed."
    fi
}

function installMaven()
{
    which mvn >/dev/null 2>&1
    res=$?
    if [ $res -eq 1 ]; then 
        sudo apt-add-repository -y ppa:andrei-pozolotin/maven3
	sudo apt-get update
        sudo apt-get install -y maven3
 
        which mvn  >/dev/null 2>&1
        res=$?
        if [ $res -ne 0 ]; then
            echo "maven3 package was not installed properly, please contact Truck Tenant support." 
            exit 1
        fi

    elif [ $res -eq 0 ]; then
        echo "maven is already installed in this server."
    fi
}

function deployTruckTenantCloudStack()
{
    mkdir -p /opt/truck
    cp -R $BASE_DIR/tools/* /opt/truck/
    #cp -R $BASE_DIR/certs /opt/truck
    cp -R $BASE_DIR/freeboard/* /var/www/html/
    pushd /etc/init.d >/dev/null 2>&1
    if [ ! -f ./sparkstreaming ];then 
        ln -s /opt/truck/sparkstreaming .
        update-rc.d sparkstreaming defaults >/dev/null 2>&1
    fi
    popd >/dev/null 2>&1
    if [ -d /opt/cloudera/parcels/CDH/jars ]; then
        cp  $BASE_DIR/tools/lib/htrace-core-3.1.0-incubating.jar /opt/cloudera/parcels/CDH/jars/
        echo "Successfully deployed Freeboard dashboard and tools."
    else
        echo "Seems to be this server is not a part of CDH cluster."
    fi
}

function deployRestAPIWar()
{
    echo "Building Hbase Rest API code is in progress ...."
    pushd $BASE_DIR/restapi > /dev/null 2>&1
    mvn clean install -DskipTests=true > ./build.log 2>&1
    res=$?
    popd > /dev/null 2>&1
    if [ $res -eq 0 -a -d $BASE_DIR/restapi/target ]; then 
        cp "$BASE_DIR/restapi/target/bimarian-rest.war" /opt/jetty/webapps/
        rm -f $BASE_DIR/restapi/build.log
        echo "Successfully build Hbase REST API code and deployed war file in Jetty server."
    else
       echo "Compilation of Hbase Rest API code is failed, look at error trace in: $BASE_DIR/restapi/build.log"
       exit 1
    fi
}

function deploySparkSreamingJar()
{
    echo "Building Sparkstreaming code is in progress ...."
    if [ ! -d /opt/truck/lib/SparkHBase.jar ]; then
        cat /opt/truck/lib/SparkHBase.jar_a* > /opt/truck/lib/SparkHBase.jar
    fi
    pushd $BASE_DIR/sparkstreaming > /dev/null 2>&1
    mvn clean install -DskipTests=true > ./build.log 2>&1
    res=$?
    popd > /dev/null 2>&1
    if [ $res -eq 0 -a -d $BASE_DIR/sparkstreaming/target ]; then 
    	cp $BASE_DIR/sparkstreaming/target/bimarian-streaming-jar-with-dependencies.jar /opt/truck/bimarian-streaming.jar
        rm -f $BASE_DIR/sparkstreaming/build.log
        echo "Successfully build Sparkstreaming code and deployed to /opt/truck folder."
    else
       echo "Compilation of Sparkstreaming code is failed, look at error trace in: $BASE_DIR/sparkstreaming/build.log"
       exit 1
    fi
}

dependencyCheck;
#installApache;
#installMaven;
#installJettyServer;
deployTruckTenantCloudStack;
deployRestAPIWar;
deploySparkSreamingJar;
echo "Successfully completed Truck Tenant cloudstack setup."
