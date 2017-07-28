
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Mongoose Schema for words

const defaultSchema = new Schema({
}, {
    versionKey : false,
    strict: false
});


const user_model = mongoose.model("Users", defaultSchema);
const chat_model = mongoose.model("Chats", defaultSchema);
const message_model = mongoose.model("Messages", defaultSchema);
const chat_user_model = mongoose.model("chatsUsers", defaultSchema);


module.exports = {user_model, chat_model, message_model, chat_user_model};