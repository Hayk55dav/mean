var Users = require('../models/user');
var Chat = require('../models/chat');
var ChatGroup = require('../models/chatGroup');



module.exports.uploadImage = function (req,res,next) {
    if(!req.file){
        res.json({success: false, message: "Error upload image"});
    } else {
        res.json({success: true, file: req.file});
        //res.sendFile(req.file.path);
    }
};
module.exports.sockets = function(io) {
    io.on('connection', function (socket) {
        console.log('User connected');
        socket.on('disconnect', function() {
            console.log('User disconnected');
        });
        socket.on('sendMessage', function (data) {
            io.emit('new-message', data);
        });
        socket.on('keyUp',function (data) {
            io.emit('upKey',data);
        })
    });
};

module.exports.getAllChats = function (req,res,next) {
    Chat.find({ room: req.params.room }, function (err, chats) {
        if (err) return next(err);
        res.json(chats);
    });
};

module.exports.saveChat = function (req,res,next) {
    if(!req.body){
        res.json({success: false, message: 'Required'});
    }else{
        var newMessage = new Chat();
        newMessage.room = req.body.room;
        newMessage.username = req.body.username;
        newMessage.message = req.body.message;
        newMessage.updated_at = req.body.updated_at;
        newMessage.imgPath = req.body.img;
        newMessage.save(function (err) {
            if(err){
                console.log('Dont Saved');
                res.json({success: false, message: err});
            }else{
                console.log('Saved!');
                res.json({success: true, message: 'Message Send!'});
            }
        })
    }
};

module.exports.addChat = function (req, res, next) {
    var toSave = [req.body.myusername, req.body.yourusername];
    var saveTo = [req.body.yourusername, req.body.myusername];
    ChatGroup.findOne({users: toSave},function (err, created) {
        if(err){
            res.json({success: false, message: 'Chat Groupi mej user chka'});
        }else {
            if(!created) {
                ChatGroup.findOne({users: saveTo},function (err, much) {
                    if(err){
                        res.json({success: false, message: 'Error SAVE TO'});
                    }else{
                        if(!much){
                            ChatGroup.create({users: toSave},function (err, saved) {
                                if(err){
                                    res.json({success: false, message: 'Create i Error'});
                                }else{
                                    res.json({success: true, chat:{id: saved._id, users: saved.users}});
                                    Users.find({username: toSave},function (err, users) {
                                        if(err){
                                            res.json({success: false, message: 'Ydpes Usernerov DB chka'});
                                        }else{
                                            if(!users){
                                                res.json({success: false, message: 'No users on chat!'});
                                            }else{
                                                users[0].chats.push({
                                                    chatId: saved._id,
                                                    noRead: 0
                                                });
                                                users[0].save();
                                                users[1].chats.push({
                                                    chatId: saved._id,
                                                    noRead: 0
                                                });
                                                users[1].save();
                                                }
                                            }
                                    })
                                }
                            });
                        }else{
                            var obj = {id: much._id, users: much.users};
                            res.json({success: true, chat: obj});
                        }
                    }
                });
            } else {
                var object = {id: created._id, users: created.users};
                res.json({success: true, chat: object});
            }
        }
    });
};


module.exports.add = function (req,res,next) {
    if(!req.body.id){
        res.json({success: false, message: 'ID not found'});
    } else{
        ChatGroup.findOne({ _id: req.body.id}).select('users usersgroup').exec(function (err,chat) {
            if(err){
                res.json({success: false, message: err});
            }else{
                res.json({success: true, chat: chat});
            }
        })
    }
};

module.exports.sendMessage = function (req, res, next) {
    if(!req.body.id){
        res.json({success: false, message: 'Message not found'});
    } else{
        ChatGroup.findOne({ _id: req.body.id}, function (err,chat) {
            if(err){
                res.json({success: false, message: err});
            }else{
                if(!chat){
                    res.json({success: false, message: "chat not found"});
                }else{
                    console.log(req.body);
                    chat.usersgroup.push({
                        sender: req.body.username,
                        message: req.body.message,
                        updated_at: req.body.updated_at,
                        likes: 0,
                        imgPath: req.body.img
                    });
                    chat.save();
                }
            }
        })
    }
};

module.exports.getAllChatGroups = function (req,res,next) {
    var username = req.body.username;

    Users.findOne({username:username},function (err, users) {
        if(err){
            res.json({success: false, message: err});
        }else{
            if (!users) {
                res.json({success: false, message: 'No Chat groups'});
            }else{

                var chatIds = [];
                var chatReadId =[];
                for(var i = 0; i < users.chats.length; i++){
                    chatIds.push(users.chats[i].chatId);
                    chatReadId.push({ id: users.chats[i].chatId , noRead: users.chats[i].noRead});
                }
                ChatGroup.find({_id: chatIds},function (err , chatGroups) {
                    if(err){
                        res.json({success: false, message: err});
                    }else{
                        if(!chatGroups){
                            res.json({success: false, message: 'No Chat groups'});
                        }else{
                            var roomDetails = [];
                            for(var i = 0; i < chatGroups.length; i++){
                                chatGroups[i].users.splice(chatGroups[i].users.indexOf(username),1);
                                for (var id = 0; id< chatReadId.length; id++){
                                    if(JSON.stringify(chatGroups[i]._id) === JSON.stringify(chatReadId[id].id)){
                                        roomDetails.push(
                                            {
                                                roomName: chatGroups[i].users,
                                                roomId: chatGroups[i]._id,
                                                noReadMessage: chatReadId[id].noRead
                                            }
                                        );
                                    }
                                }
                            }
                            res.json({success: true, chats: roomDetails});
                        }
                    }
                })
            }
        }
    })
};

module.exports.readChat = function (req, res, next) {
  Users.find({username: req.body.users},function (err, users) {
      if(err){
          res.json({success: false, message: err});
      }else{
          if(!users){
              res.json({success: false, message: 'undefined'});
          }else{
              for(var user in users){
                  for(var id = 0 ; id < users[user].chats.length; id++){
                      if(JSON.stringify(users[user].chats[id].chatId) === JSON.stringify(req.body.id)){
                          users[user].chats[id].noRead +=1;
                          users[user].save();
                      }
                  }
              }
          }
      }
  })
};

module.exports.checkRead = function (req,res,next) {
  Users.findOne({username:req.body.username},function (err, users) {
      if(err){
          res.json({success: false, message: err});
      }else{
          if(!users){
              res.json({success: false, message: 'No User found!'});
          }else{
              for(var i = 0; i < users.chats.length; i++){
                  if(JSON.stringify(users.chats[i].chatId) === JSON.stringify(req.body.id)){
                      users.chats[i].noRead = 0;
                      users.save();
                  }
              }
          }
      }
  })
};

module.exports.addUserToChat = function (req,res,next) {
    if(!req.body){
        res.json({success: false, message: 'Required request body'});
    }else{
        Users.findOne({username: req.body.username},function (err,user) {
            if(err){
                res.json({success: false, message: err});
            }else{
                if(!user){
                    res.json({success: false, message: 'No User'});
                }else{
                    user.chats.push({
                        chatId: req.body.id,
                        noRead: 0
                    });
                    user.save(function (err) {
                        if(err){
                            res.json({success: false, message: err});
                        }else {
                            ChatGroup.findOne({_id: req.body.id},function (err, chat) {
                                if(err){
                                    res.json({success: false, message: err});
                                }else{
                                    if(chat){
                                        chat.users.push(req.body.username);
                                        chat.save(function (err) {
                                            if(err){
                                                res.json({success: false, message: err});
                                            }
                                        })

                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    }
};

