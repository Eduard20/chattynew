
const mongoRequests = require("../dbRequests/mongoRequests");
const tokenFunction = require("./users");
const _ = require("underscore");

const chat = {

    addChat : (data, next) => {
        mongoRequests.addChat(data, (err, doc) => {
            if (err) return next({error : true, message : err});
            const obj = {
                username : doc.username,
                chatId : doc._id
            };
            chat.addChatUser(obj, next);
        });
    },

    getChats : (req, next) => {
        const decoded = tokenFunction.decodeToken(req.headers.authorization);
        mongoRequests.getChats(decoded.username, (err, result) => {
            if (err) return next({error : true, message : err});
            const chatId = [];
            _.each(result, one => chatId.push(one.chatId));
            mongoRequests.getChatInfo(chatId, (err, result) => {
                if (err) return next({error : true, message : err});
                next({error : false, doc : result});
            });
        })
    },

    addChatUser : (obj, next) => {
        mongoRequests.addChatUser(obj, err => {
            if (err) return next({error : true, message : err});
            next({error : false});
        });
    }

};

module.exports = chat;