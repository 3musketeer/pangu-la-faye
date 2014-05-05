var fs = require('fs'),
    mongoose = require('mongoose'),   
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env],
    logger = require('../log').logger;

var warningType = {'error':'异常','timeOut':'超时'};

exports.dealPlugin = function(bayeux){
        
   
    var db = mongoose.createConnection(config.db);    	   	
    var updateExtension = { 
        incoming: function(message, callback) {
            if (message.channel.indexOf('/SystemMessage/') != -1){
                var dt = new Date();
                var YY = ("00"+dt.getFullYear()%100).substr(-2),
            	      MM = ("00"+(dt.getMonth() + 1)).substr(-2),
            	      DD = ("00"+dt.getDate()).substr(-2),
            	      HH = ("00"+dt.getHours()).substr(-2);
            	      
            	  var collection = 'warning'+YY+MM+DD;   
            	  var table = db.model('warningInfo',collection); 
                logger.debug('message=%s',JSON.stringify(message));
                table.update({_id:message.data.id},{$set:{state:'1'}},function(err){
        		        if(err) throw new Error(err);	 	    
                });
            }  
            callback(message);    
        }
    };
    bayeux.addExtension(updateExtension);
    
    var tref;
    var schedule = function() {
        var dt = new Date();
        var YY = ("00"+dt.getFullYear()%100).substr(-2),
    	      MM = ("00"+(dt.getMonth() + 1)).substr(-2),
    	      DD = ("00"+dt.getDate()).substr(-2),
    	      HH = ("00"+dt.getHours()).substr(-2);
    	      
    	  var collection = 'warning'+YY+MM+DD;
    	  logger.debug('collection=%s',collection);    
    	  var table = db.model('warningInfo',collection);  
        table.find({'state': '1'}, function(err, resultRow){
            if(err)  throw new Error(err);	
            if(resultRow){
                resultRow.forEach(function(item){  
                    logger.debug('item=%s',JSON.stringify(item));
                    
                    var content = '异常类型：'+ warningType[item.type]+'</br>';
                    content = content + '异常时间：'+ item.time +'</br>';
                    if(message.host !='all'){
                        content = content + '异常主机：'+item.host +'</br>';
                    }
                    content = content + '异常内容：</br>' + item.detail+'</br>';
                    content = content + '-------------------------------------------------------------'+'</br>'; 
                    bayeux.getClient().publish('/SystemMessage/'+item.type, content); 
                })
            }
        });
        tref = setTimeout(schedule, 6000);
    }
       
    schedule();    

}