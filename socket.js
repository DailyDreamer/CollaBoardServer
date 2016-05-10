let models = require('./models');

let socket = function(http) {
  let io = require('socket.io')(http);
  io.on('connection', (socket) => {
    let rid = '';
    socket.on('join', (id) => {
      console.log('a user join room ' + id);
      rid = id;
      socket.join(id);
    });
    socket.on('disconnect', () => {
      console.log('a user leave room ' + rid);
      socket.leave(rid);
    });

    let events = ['ADD', 'STYLE_CHANGE', 'CONTENT_CHANGE', 'DELETE', 'ADD_LINK', 'DELETE_LINK'];

    events.map(listen);

    function listen(e) {
      socket.on(e, (msg) => {
        socket.broadcast.to(rid).emit(e, msg);

        models.Room.findById(rid, (err, room) => {
          if (err) {
            console.log(err);
            return;
          } else if(room) {

          } else {
            console.log('Room not exist!');
            return;
          }
          switch (e) {
            case 'ADD':
              dbAdd(msg, room);
              break;
            case 'STYLE_CHANGE':
              dbStyleChange(msg, room);
              break;
            case 'CONTENT_CHANGE':
              dbContentChange(msg, room);
              break;
            case 'DELETE':
              dbDelete(msg, room);
              break;
            case 'ADD_LINK':
              dbAddLink(msg, room);
              break;
            case 'DELETE_LINK':
              dbDeleteLink(msg, room);
              break;
            default:
              console.log('unknown event');;
          }
        });
      });

      function dbAdd(msg, room) {
        let note = JSON.parse(msg);
        let notes = JSON.parse(room.notes);
        notes[note.id] = note;
        room.notes = JSON.stringify(notes);
        room.save();
      }

      function dbStyleChange(msg, room) {
        let style = JSON.parse(msg);
        let notes = JSON.parse(room.notes);
        notes[style.id].x = style.x;
        notes[style.id].y = style.y;
        room.notes = JSON.stringify(notes);
        room.save();
      }

      function dbContentChange(msg, room) {
        let content = JSON.parse(msg);
        let notes = JSON.parse(room.notes);
        notes[content.id].content = content.content;
        room.notes = JSON.stringify(notes);
        room.save();
      }

      function dbDelete(msg, room) {
        let id = JSON.parse(msg);
        let notes = JSON.parse(room.notes);
        let links = JSON.parse(room.links);

        for (let k of Object.keys(links)){
          if (links[k].source === id || links[k].target === id)
            delete links[k];
        }
        delete notes[id];

        room.links = JSON.stringify(links);
        room.notes = JSON.stringify(notes);
        room.save();
      }

      function dbAddLink(msg, room) {
        let link = JSON.parse(msg);
        let links = JSON.parse(room.links);
        links[link.source+':'+link.target] = link;
        room.links = JSON.stringify(links);
        room.save();
      }

      function dbDeleteLink(msg, room) {
        let id = JSON.parse(msg);
        let links = JSON.parse(room.links);
        delete links[id];
        room.links = JSON.stringify(links);
        room.save();
      }
    }
  });
}

module.exports = socket;
