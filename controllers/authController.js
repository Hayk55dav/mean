const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');


// Register user function
module.exports.register = function (req,res,next) {
        if(!req.body.email){
                res.json({success: false, message: 'You must provide an E-mail'});
        }else {
            if(!req.body.username){
                res.json({success: false, message: 'You must provide an Username'});
            }else {
                    if(!req.body.password) {
                        res.json({success: false, message: 'You must provide an Password'});
                    }else {
                            var user = new User();
                            user.email = req.body.email.toLowerCase();
                            user.username = req.body.username.toLowerCase();
                            user.password = user.generateHash(req.body.password);
                            user.save(function (err) {

                                if(err){
                                    if(err.code === 11000){
                                        res.json({success: false, message: 'Email or Username already exists!'});
                                    }else {
                                        if(err.errors){
                                            if(err.errors.email){
                                                res.json({success: false, message: err.errors.email.message});
                                            }else {
                                                if(err.errors.username){
                                                    res.json({success: false, message: err.errors.username.message});
                                                }else {
                                                        res.json({success: false, message: err});
                                                }
                                            }
                                        }else {
                                            res.json({success: false, message: 'Could not save user, Error'+ err});
                                        }

                                    }
                                }else {

                                        res.json({success: true, message: 'Accaunt Registered'});
                                }
                            })
                    }
            }
        }
};

// Function for Check Email
module.exports.checkEmail = function (req,res,next) {
    if(!req.params.email){
        res.json({success: false, message: 'E-mail was not provided'});
    }else {
        User.findOne({email: req.params.email},function (err,user) {
            if(err){
                res.json({success: false, message: 'ERR!'});
            }else {
                if(user){
                    res.json({success: false, message: 'E-mail is already token'});
                }else {
                    res.json({success: true, message: 'E-mail is available'});
                }
            }
        })
    }
};

// Function for  Check Username
module.exports.checkUsername = function (req,res,next) {
    if(!req.params.username){
        res.json({success: false, message: 'Username was not provided'});
    }else {
        User.findOne({username: req.params.username},function (err,user) {
            if(err){
                res.json({success: false, message: err})
            }else {
                if(user){
                    res.json({success: false, message: 'Username is already token'});
                }else {
                    res.json({success: true, message: 'Username is available'});
                }
            }
        })
    }
};

module.exports.login = function (req,res, next) {
    if(!req.body.username){
        res.json({ success: false, message: " No username was provided"});
    }else{
        if(!req.body.password){
            res.json({success: false, message: " No password was provided"})
        }else{
            User.findOne({username: req.body.username.toLowerCase()}, function (err,user) {
                if(err){
                    res.json({success: false, message: err});
                }else{
                    if(!user){
                        res.json({success: false, message: ' User Not fount'});
                    }else{
                        if(user){
                            if(!user.comparePassword(req.body.password)){
                                res.json({succses: false, message: "Password error"});
                            }else{
                                var token = jwt.sign({userId: user._id}, config.secret, {expiresIn: '24h'});
                                res.json({success: true, message: 'Success', token: token, user:{username: user.username}});
                            }
                        }
                    }
                }
            })
        }
    }
};

module.exports.profileUse = function (req,res,next) {
    const token = req.headers['authorization'];
    if(!token){
        res.json({success: false , message: 'No token Provided'});
    }else {
        jwt.verify(token, config.secret, function (err,decoded) {
            if(err){
                res.json({success: false, message: 'Token Invalid ' + err});
            }else {
                req.decoded = decoded;
                next();
            }
        })
    }
};
// Get profile
module.exports.getProfile = function (req,res,next) {
    User.findOne({_id: req.decoded.userId}).select('username email chats').exec(function (err,user) {
        if(err){
            res.json({success: false, message: err});
        }else{
            if(!user){
                res.json({success: false, message: 'User not found'});
            }else {
                res.json({success: true, user: user});
            }
        }
    })
};

module.exports.publicProfile = function (req,res,next) {
    if(!req.params.username){
        res.json({success: false, message: 'No username was provided!'});
    }else{
        User.findOne({username: req.params.username}).select('username email').exec(function(err, user) {
            if(err){
                res.json({success: false, message: 'Something went wrong.'});
            }else{
                if(!user){
                    res.json({success: false, message: 'User not found'});
                }else{
                    res.json({success: true, user: user});
                }
            }
        });
    }
};

module.exports.getAllUsers = function (req,res,next) {
  User.find({}).sort({'_id': -1}).select("username email _id").exec(function (err,users) {
      if(err){
          res.json({success: false, message: err});
      }else{
          if(!users){
              res.json({success: false, message: 'Users not found'});
          }else{
              res.json({success: true, users: users});
          }
      }
  });
};