const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

var emailLengthChecker = function (email) {
    if(!email){
        return false;
    }else {
        if(email.length < 5 || email.length > 40 ){
            return false;
        }else {
            return true;
        }
    }
};

var validEmailChecker = function (email) {
    if(!email){
        return false;
    }else {
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email);
    }
};

var usernameLengthChecker = function (username) {
    if(!username){
        return false;
    }else {
        if(username.length < 5 || username.length > 20 ){
            return false;
        }else {
            return true;
        }
    }
};

var validUsername = function (username) {
    if(!username){
        return false;
    }else {
        const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
        return regExp.test(username);
    }
};



const emailValidators = [
    {
        validator: emailLengthChecker,
        message: 'Email > 5 && Email < 40 simvol'
    },

    {
        validator: validEmailChecker,
        message: 'Valid Email'
    }
];

const usernameValidators = [
    {
        validator: usernameLengthChecker,
        message: 'Username > 5 && Username < 20 simvol'
    },
    {
        validator: validUsername,
        message: 'Valid username'
    }
];


var userSchema = new Schema({
      email: {type: String, required: true, unique: true, lowercase: true, validate: emailValidators},
      username: {type: String, required: true, unique: true, lowercase: true, validate: usernameValidators},
      password: {type: String, required: true},
      chats: [
          {
              chatId: {type:String},
              noRead: {type:Number}
          }
      ]
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', userSchema);