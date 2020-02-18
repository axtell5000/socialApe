const proxy = require('http-proxy-middleware')

// need this to help with CORS when fetching from client side

module.exports = function(app) {
  app.use(    
    proxy('/screams', { 
      target: 'https://europe-west1-socialape-89327.cloudfunctions.net/api',
      changeOrigin: true
    })
  );
  app.use(    
    proxy('/login', { 
      target: 'https://europe-west1-socialape-89327.cloudfunctions.net/api',
      changeOrigin: true
    })
  );
  app.use(    
    proxy('/signup', { 
      target: 'https://europe-west1-socialape-89327.cloudfunctions.net/api',
      changeOrigin: true
    })
  );     
}