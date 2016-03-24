var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var origin = "http://localhost:8080";
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  var rid = '';
  socket.on('join', function(id) {
    console.log('a user join room ' + id);
    rid = id;
    socket.join(id);
  });
  socket.on('disconnect', function() {
    console.log('a user leave room ' + rid);
    socket.leave(rid);
  });

  socket.on('object:added', function(msg) {
    socket.broadcast.emit('object:added', msg);
  });

  socket.on('object:removed', function(msg) {
    socket.broadcast.emit('object:removed', msg);
  });

  socket.on('note:added', function(msg) {
    socket.broadcast.emit('note:added', msg);
  });

  socket.on('object:modified', function(msg) {
    socket.broadcast.emit('object:modified', msg);
  })
});


var router = express.Router();

router.get('/', function(req, res) {
  res.send('hello world');
});

router.get('/rid', function(req, res) {
  //gen CSPRNG code with (bits, radix).
  res.json(require('csprng')(160, 16));
});


app.use('/api', router);



http.listen(3000, function () {
  console.log(require('os').networkInterfaces());
  console.log('App listening on port 3000!');
});
