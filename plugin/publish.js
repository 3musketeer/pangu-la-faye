var fs = require('fs'),
    mongoose = require('mongoose'),   
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

exports.dealPlugin = function(bayeux){
       	
    var db = mongoose.createConnection(config.db)	
    var tref;
    var schedule = function() {
        bayeux.getClient().publish('/SystemMessage/WarningSign', {text:'12345678'});
        tref = setTimeout(schedule, 3000);
    };
    tref = setTimeout(schedule, 3000);
}