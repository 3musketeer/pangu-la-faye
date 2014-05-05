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
    
    port       = config.bayeux.port,
    pluginItem     = process.argv[2] ||'';


logger.debug('pluginItem=%s',pluginItem);

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


var server = http.createServer(handleRequest);
bayeux.attach(server);
server.listen(Number(port));

//Plug-in technology    
if( pluginItem != ''){
    // Bootstrap models
    var models_path = __dirname + '/plugin/models'
    fs.readdirSync(models_path).forEach(function (file) {
        if (~file.indexOf('.js') &&!~file.indexOf('.swp')) require(models_path + '/' + file ) 
    })
    
    require('./plugin/'+pluginItem).dealPlugin(bayeux);
}

bayeux.on('publish', function(clientId, channel) {
  logger.debug('[  publish] ' + ' -> ' + channel);
});

logger.debug('Listening on ' + port);
