var express = require('express');
var app = express();

// Socket.io Server

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
          console.log('Room not exist!');
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
  }
});

// Http Server

//app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var origin = "http://localhost:8080";
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", origin);
  //res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var secret = 'secret';

app.use(expressJwt({
  secret: secret,
  getToken: function(req) {
    if (req.cookies['token']) {
      return req.cookies['token'];
    }
    return null;
  }
}).unless({
  path: ['/api/login', '/api/signUp']
}));

var router = express.Router();

router.get('/', function(req, res) {
  res.send('hello world');
});

router.post('/room', function(req, res) {
  //gen CSPRNG code with (bits, radix).
  function newRoom() {
    var rid = require('csprng')(160, 16);
    var rname = req.body.rname;
    models.Room.findById(rid, function(err, room) {
      if (err) {
        console.log(err);
      } else if (room) {
        newRoom();
      } else {
        //sucess
        models.User.findById(req.user.username, function(err, user) {
          if (err) {
            console.log(err);
          } else if (user) {
            res.json(rid);
            user.rooms.push({ rid:rid, rname:rname });
            user.save();
          } else {
            //if user deleted from one client and cookies of other client not expire
            res.status(401).send('Unauthorized');
            console.log('User not exist!');
          }
        });
        var room = new models.Room({
          _id: rid,
          name: rname,
          objects: '{}'
        });
        room.save();
      }
    });
  }
  newRoom();
});

router.get('/room/:rid', function(req, res) {
  models.Room.findById(req.params.rid, function(err, room) {
    if (err) {
      console.log(err);
    } else if(room) {
      res.send(room.objects);
      models.User.findById(req.user.username, function(err, data) {
        if (err) {
          console.log(err);
        } else if (data) {
          var hasRoom = false;
          for (var r of data.rooms) {
            if (r.rid === room._id) {
              hasRoom = true;
              break;
            }
          }
          if (!hasRoom) {
            data.rooms.push({ rid:room._id, rname: room.name });
            data.save();
          }
        }
      });
    } else {
      res.status(404).send('Room not exist');
      console.log('Room not exist!');
    }
  });
});

router.post('/signUp', function(req, res) {
  var user = req.body;
  models.User.findById(user._id, function(err, data) {
    if (err) {
      console.log(err);
      res.json(JSON.stringify({err: err}));
    } else if(data) {
      res.json(JSON.stringify({err: 'User already exist!'}));
    } else {
      var newUser = new models.User({
        _id: user._id,
        password: user.password,
        rooms: [],
      });
      newUser.save();
      res.json(JSON.stringify({success: 'Success'}));
    }
  });
});

router.post('/login', function(req, res) {
  var user = req.body;
  models.User.findById(user._id, function(err, data) {
    if (err) {
      console.log(err);
      res.json(JSON.stringify({err: err}));
    } else if(data) {
      if (user.password === data.password){
        var token = jwt.sign({ username: user._id }, secret);
        res.cookie('token', token, { maxAge: 180*24*3600*1000, httpOnly: true });
        res.json(token);
      } else {
        res.json(JSON.stringify({err: 'Password not valid!'}));
      }
    } else {
      res.json(JSON.stringify({err: 'User not exist!'}));
    }
  });
});

router.post('/logout', function(req, res) {
  res.clearCookie('token');
});

router.get('/user', function(req, res) {
  models.User.findById(req.user.username, function(err, data) {
    if (err) {
      console.log(err);
      res.json(JSON.stringify({err: err}));
    } else if (data) {
      res.json(data);
    } else {
      res.json(JSON.stringify({err: 'User not exist!'}));
    }
  });
});

app.use('/api', router);



http.listen(3000, function () {
  console.log(require('os').networkInterfaces());
  console.log('App listening on port 3000!');
});
