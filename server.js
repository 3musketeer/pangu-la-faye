var fs    = require('fs'),
    path  = require('path'),
    http  = require('http'),
    https = require('https'),
    mime  = require('mime'),
    faye = require('faye'),
    fayeRedis = require('faye-redis'),
    logger = require('./log').logger;
    
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

var SHARED_DIR = __dirname,
    PUBLIC_DIR = SHARED_DIR + '/public',


    bayeux = new faye.NodeAdapter({
      mount:    '/faye',
      timeout:  60,
      engine:   {
        type:   fayeRedis,
        host:   config.redis.host,
        port:   config.redis.port
      }
    }),
    
    port       = process.argv[2] || config.bayeux.port,
    secure     = process.argv[3] === 'ssl';
    //key        = fs.readFileSync(SHARED_DIR + '/server.key'),
  //  cert       = fs.readFileSync(SHARED_DIR + '/server.crt');


var handleRequest = function(request, response) {
  var path = (request.url === '/') ? '/index.html' : request.url;


  fs.readFile(PUBLIC_DIR + path, function(err, content) {
  
    var status = err ? 404 : 200;
    try {
      response.writeHead(status, {'Content-Type': mime.lookup(path)});
      response.end(content || 'Not found');
    } catch (e) {}
  });
};


var server = secure
           ? https.createServer({cert: cert, key: key}, handleRequest)
           : http.createServer(handleRequest);


bayeux.attach(server);
server.listen(Number(port));


//bayeux.getClient().subscribe('/chat/*', function(message) {
 // logger.debug('[' + message.user + ']: ' + message.message);
//});


bayeux.on('subscribe', function(clientId, channel) {
  logger.debug('[  SUBSCRIBE] ' + clientId + ' -> ' + channel);
});


bayeux.on('unsubscribe', function(clientId, channel) {
  logger.debug('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
});


bayeux.on('disconnect', function(clientId) {
  logger.debug('[ DISCONNECT] ' + clientId);
});

logger.debug('Listening on ' + port + (secure? ' (https)' : ''));
