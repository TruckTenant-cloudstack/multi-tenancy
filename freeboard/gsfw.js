var sendData = '&lt;?xml version=\"1.0\" encoding=\"UTF-8\"? &glt;'+
    '&lt;configuration &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;user.name&lt;/name &glt;'+
    '&lt;value &glt;root&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;nameNode&lt;/name &glt;'+
    '&lt;value &glt;hdfs://cdh-dev1.c.utopian-honor-94915.internal:8020&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;jobTracker&lt;/name &glt;'+
    '&lt;value &glt;cdh-dev1.c.utopian-honor-94915.internal:8032&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;master&lt;/name &glt;'+
    '&lt;value &glt;yarn-cluster&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;queueName&lt;/name &glt;'+
    '&lt;value &glt;default&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;tenant&lt;/name &glt;'+
    '&lt;value &glt;'+channelval+'&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;query&lt;/name &glt;'+
    '&lt;value &glt;'+qry+'&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;oozieProjectRoot&lt;/name &glt;'+
    '&lt;value &glt;batch_analytics&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;oozie.use.system.libpath&lt;/name &glt;'+
    '&lt;value &glt;true&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;property &glt;'+
    '&lt;name &glt;oozie.wf.application.path&lt;/name &glt;'+
    '&lt;value &glt;${nameNode}/user/${user.name}/${oozieProjectRoot}&lt;/value &glt;'+
    '&lt;/property &glt;'+
    '&lt;/configuration &glt;';