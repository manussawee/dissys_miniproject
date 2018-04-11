var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Group = require('../models/group.js');
var Message = require('../models/message.js');
var Join = require('../models/join.js');

/* GET home page. */
router.post('/auth', function(req, res, next) {
  var query = {name:req.body.name};
  User.find(query, function(err, users) {
    if(err) throw err
    else if(users.length == 0){
      var user_model = new User(query);
      user_model.save(function (err,userss){
        if(err) throw err
        return res.send({"uid": userss.id});
      });
    }
    else  return res.send({"uid": users[0].id}); 
    });
});

router.get('/getAllGroup', function(req, res) {
  Group.find({}, function(err,groups){
    if(err) throw err;
    else {
      return res.send(groups);      
    }
  });
  // console.log(query);
});

router.post('/createGroup', function(req, res){
  var query = {name:req.body.gname};
  Group.find(query, function(err,groups){
      if(err) console.log("group finding error");
      else if(groups.length == 0){
        var group_model = new Group(query);
        group_model.save(function(err, group){
            if(err) throw err;
            var join_model = new Join({uid:req.body.uid, gid:group.id, read_at:0});
            join_model.save(function(err){
              if(err) throw err;
              console.log("GROUP CREATED BY AN UID");
              return res.send({"gid":group.id});
            })
        })
      }
      else{
          console.log("GROUP ALREADY CREATED");
          return res.send({"gid":groups[0].id});
      }
  })
});

router.post('/joinGroup', function(req, res){
  var query = {_id:req.body.gid};
  Group.find(query, function(err,groups){
      if(err) throw err
      if(groups.length == 0){
        console.log("NOT FOUND GROUP");
        return res.send("NOT FOUND");
      }
      else{
        console.log("FOUND GROUP");
        var join_model = new Join({uid:req.body.uid, gid:req.body.gid, read_at:0});
        join_model.save(function(err){
            if(err) throw err;
            else
              return res.send("EXISTED");
        })
      }
  })
});

router.post('/leaveGroup',function(req,res){
  var query = {uid:req.body.uid, gid:req.body.gid};
  Join.remove(query,function(err,joins){
    if (err) {
      console.log("CANNOT LEAVE GROUP");
      throw err
    }
    else
      return res.send("LEAVE GROUP")
    
  });
});


router.post('/sendMessage', function(req,res){
  var Iuid = req.body.uid;
  var Igid = req.body.gid;
  var Icontent = req.body.content;
  var query = Group.findOne({gid:Igid});
  query.select('gid');
  query.exec(function(err, group){
    if(err) throw err;
    else{
      var message_model = new Message({uid:Iuid, gid:Igid, content:Icontent, send_at:Date.now()});
      message_model.save(function(err){
        if(err) {
          res.send("ERROR SAVING MESSAGE");
          throw err
        }
        res.send("MESSAGE SAVED")
      })
    }
  })
});

router.get('/getUserInfo', function(req,res){
  Join.find({uid:req.query.uid}, function(err, joins){
    var result = [];
    joins.map((join, index) => {
      Group.find({_id:join.gid}, function(err, groups){
        result.push(groups[0]);
        if(index === joins.length - 1) {
          res.send(result)
        }
      })
    });
  });
});

module.exports = router;
