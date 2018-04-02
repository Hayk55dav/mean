const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;



var chatGroupSchema = new Schema({
    room: String,
    users: {type: Array},
    usersgroup: [
        {
            sender: String,
            message: String,
            likes: Number,
            updated_at: {type: Date, default: Date.now},
            imgPath: String
        }
    ]
});

module.exports = mongoose.model('chatgroup', chatGroupSchema);