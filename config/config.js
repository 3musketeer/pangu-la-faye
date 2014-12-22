var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')

module.exports = {
  development: {
  	 
	  db: 'mongodb://127.0.0.1/tuxlog',
	  root: rootPath,    
	  
	  bayeux: {
        host:'127.0.0.1',
        port:'8001'
    },
    
    redis: {
        host:'127.0.0.1',
        port:'6379'
    }
		
  }
}
