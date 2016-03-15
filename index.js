var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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
    var pathObj = JSON.parse(msg);
    socket.broadcast.emit('object:added', msg);
  });
  socket.on('note:added', function(msg) {
    socket.broadcast.emit('note:added', msg);
  });
});


var router = express.Router();

router.get('/', function(req, res) {
  res.send('hello world');
});


app.use('/api', router);



http.listen(3000, function () {
  console.log(require('os').networkInterfaces());
  console.log('App listening on port 3000!');
});
