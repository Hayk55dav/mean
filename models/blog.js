const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

var titleLengthChecker = function (title) {
    if(!title){
        return false;
    }else {
        if(title.length < 5 || title.length > 50 ){
            return false;
        }else {
            return true;
        }
    }
};

var alphaNumericTitleChecker = function (title) {
    if(!title){
        return false;
    }else {
        const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
        return regExp.test(title);
    }
};

var bodyLengthChecker = function (body) {
    if(!body){
        return false;
    }else {
        if(body.length < 5 || body.length > 500 ){
            return false;
        }else {
            return true;
        }
    }
};


const titleValidators = [
    {
        validator: titleLengthChecker,
        message: 'title > 5 && title < 50 simvol'
    },

    {
        validator: alphaNumericTitleChecker,
        message: ' title must be aplhanumeric'
    }
];

const bodyValidators = [
    {
        validator: bodyLengthChecker,
        message: 'Body > 5 && Body < 500 simvol'
    }
];
var commentLengthChecker = function (comment) {
    if(!comment[0]){
        return false;
    }else {
        if(comment[0].length < 1 || comment[0].length > 200 ){
            return false;
        }else {
            return true;
        }
    }
};
const commentValidators = [
    {
        validator: commentLengthChecker,
        message: ' Comment < 200 simvol'
    }
];

var blogSchema = new Schema({
   title: { type: String, required: true, validate: titleValidators},
   body: { type: String, required: true, validate: bodyValidators},
    createdBy: {type: String},
    createdAt: {type: Date, default: Date.now()},
    like: {type: Number, default: 0},
    likedBy: {type: Array},
    dislike: {type: Number, default: 0},
    dislikedBy: { type: Array},
    comments: [
        {
            comment: {type: String, validate: commentValidators},
            commentator: {type: String}
        }
    ]
});

module.exports = mongoose.model('Blog', blogSchema);