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
var models = require('./models/models');

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

  var events = ['object:added', 'object:removed', 'note:added', 'object:modified'];

  events.map(listen);

  function listen(e) {
    socket.on(e, function(msg) {
      socket.broadcast.emit(e, msg);

      models.Room.findById(rid, function(err, room) {
        if (err) {
          console.log(err);
        } else if(room) {

        } else {
          room = new models.Room({
            _id: rid,
            objects: '{}'
          });
        }
        switch (e) {
          case 'object:added':
            dbAdd(msg, room);
            break;
          case 'object:removed':
            dbRemove(msg, room);
            break;
          case 'object:modified':
            dbModify(msg, room);
            break;
          case 'note:added':
            dbNoteAdd(msg, room);
            break;
          default:
            console.log('unknown event');;
        }
      });
    });
    function dbAdd(msg, room) {
      var rawObject = JSON.parse(msg);
      var objects = JSON.parse(room.objects);
      objects[rawObject.uuid] = rawObject;
      room.objects = JSON.stringify(objects);
      room.save();
    }

    function dbRemove(msg, room) {
      var rawObject = JSON.parse(msg);
      var objects = JSON.parse(room.objects);
      delete objects[rawObject.uuid];
      room.objects = JSON.stringify(objects);
      room.save();
    }

    function dbModify(msg, room) {
      var rawObject = JSON.parse(msg);
      var objects = JSON.parse(room.objects);
      objects[rawObject.uuid] = rawObject;
      room.objects = JSON.stringify(objects);
      room.save();
    }

    function dbNoteAdd(msg, room) {
      var rawObject = JSON.parse(msg);
      var objects = JSON.parse(room.objects);
      objects[rawObject.uuid] = rawObject;
      room.objects = JSON.stringify(objects);
      room.save();
    }
  }
});


var router = express.Router();

router.get('/', function(req, res) {
  res.send('hello world');
});

router.get('/genRid', function(req, res) {
  //gen CSPRNG code with (bits, radix).
  res.json(require('csprng')(160, 16));
});

router.get('/state/:rid', function(req, res) {
  models.Room.findById(req.params.rid, function(err, room) {
    if (err) {
      console.log(err);
    } else if(room) {
      res.send(room.objects);
    } else {
      res.send('');
    }
  });
});


app.use('/api', router);



http.listen(3000, function () {
  console.log(require('os').networkInterfaces());
  console.log('App listening on port 3000!');
});
