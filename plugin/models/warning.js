/*
 * 异常警告
 *
 * */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var warnSchema = new Schema({
    detail : {type : String},
    type : {type : String},
    state : {type : String},
    time : {type : String},
    host : {type : String}
});

mongoose.model('warningInfo',warnSchema);