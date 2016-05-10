let app = require('express')();
let config = require('./config.json')

// Http Server
let origin = "";
app.use((req, res, next) => {
  //TODO verify origin whitelist here
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


let expressJwt = require('express-jwt');
app.use(expressJwt({
  secret: config.JWTSecret,
  requestProperty: 'user',
  getToken: function(req) {
    if (req.cookies['token']) {
      return req.cookies['token'];
    }
    return null;
  }
}).unless({
  path: ['/api/login', '/api/signup']
}));


let bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json

let cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('hello world!')
});

app.use('/api', require('./routers'));

let http = require('http').Server(app);
// Socket.io Server
require('./socket')(http);

app.set('port', (process.env.PORT || 3000));
http.listen(app.get('port'), () => {
  console.log(require('os').networkInterfaces());
  console.log('App listening on port ' + app.get('port'));
});
