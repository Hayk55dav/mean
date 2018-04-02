const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

var chatSchema = new Schema({
    room: String,
    username: String,
    message: String,
    updated_at: { type: Date, default: Date.now },
    imgPath: String
});

module.exports = mongoose.model('Chat', chatSchema);