let router = require('express').Router()
let models = require('../models')

router.post('/', (req, res) => {
  //gen CSPRNG code with (bits, radix).
  function newRoom() {
    let rid = require('csprng')(160, 16);
    let rname = req.body.rname;
    models.Room.findById(rid, (err, room) => {
      if (err) {
        console.log(err);
        res.json({ err: err });
      } else if (room) {
        newRoom();
      } else {
        //sucess
        models.User.findById(req.user.username, (err, user) => {
          if (err) {
            console.log(err);
            res.json({ err: err });
          } else if (user) {
            user.rooms.push({ rid:rid, rname:rname });
            user.save();
            res.json(rid);
          } else {
            //if user deleted from one client and cookies of other client not expire
            res.status(401).send('Unauthorized');
            console.log('User not exist!');
          }
        });
        models.Room.create({
          _id: rid,
          name: rname,
          notes: '{}',
          links: '{}'
        });
      }
    });
  }
  newRoom();
});

router.get('/:rid', (req, res) => {
  models.Room.findById(req.params.rid, (err, room) => {
    if (err) {
      console.log(err);
      res.json({ err:err });
    } else if(room) {
      res.json(room);
      //add room to user
      models.User.findById(req.user.username, (err, data) => {
        if (err) {
          console.log(err);
        } else if (data) {
          let hasRoom = false;
          for (let r of data.rooms) {
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

module.exports = router;
