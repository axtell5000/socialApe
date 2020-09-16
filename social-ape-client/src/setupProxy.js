const proxy = require('http-proxy-middleware');

// need this to help with CORS when fetching from client side

module.exports = function(app) {

  const target = 'https://europe-west1-socialape-89327.cloudfunctions.net/api';
  app.use(    
    proxy('/screams', { 
      target,
      changeOrigin: true
    })
  );
  app.use(    
    proxy('/login', { 
      target,
      changeOrigin: true
    })
  );
  app.use(    
    proxy('/signup', { 
      target,
      changeOrigin: true
    })
  );
  app.use(    
    proxy('/user', { 
      target,
      changeOrigin: true
    })
  );         
}