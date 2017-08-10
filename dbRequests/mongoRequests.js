
const mongoose = require("mongoose");
const {user_model, chat_model, message_model, chat_user_model} = require("../models/usersModel");
const usersFunction = require("../middlewares/users");
const platformConfigs = require("../config/config");
const _ = require("underscore");
const async = require("async");
mongoose.Promise = Promise;

/**
 * MongoDb connection
 */

mongoose.connect(platformConfigs.mongoURI);
mongoose.connection.on("connected", () => {console.log("Mongo default connection open")});
mongoose.connection.on("error", (err) =>  {console.log("Mongo default connection error: " + err)});
mongoose.connection.on("disconnected", () => {console.log("Mongo default connection disconnected")});

const mongo = {

    login : (req, next) => {
        let query = {"username": req.body.username};
        async.waterfall([
            callback => {
                user_model.find(query, (err, doc) => {
                    (err) ? callback({error: true, message: err}, null) : callback(null, doc);
                });
            },
            (doc, callback) => {
                if (doc.length > 0) {
                    let data = JSON.stringify(doc[0]);
                    data = JSON.parse(data);
                    callback(null, data);
                    return;
                }
                callback({error: true, message: "Username is incorrect"}, null);
            },
            (data, callback) => {
                if (req.body.password === data.password) {
                    callback(null, {error: false, message: data});
                    return;
                }
                callback({error: true, message: "Password is incorrect"}, null);
            }
        ], (err, result) => err ? next(err) : next(result));
    },

    register : (req, next) => {
        let data = req.body;
        let query = {"username" : data.username};
        async.waterfall([
            callback => {
                user_model.find(query, (err, doc) => {
                    (err) ? callback({error: true, message: err}, null) : callback(null, doc);
                });
            },
            (doc, callback) => {
                if (doc.length > 0) {
                    callback({error: true, message: "Username already exists"}, null);
                    return;
                }
                data.token = usersFunction.generateToken(data);
                callback(null, data);
            },
            (data, callback) => {
                user_model.create(data, (err) => {
                    if (err) {
                        callback({error : true, message : err}, null);
                        return;
                    }
                    callback(null, {error : false, message : data});
                })
            }
        ], (err, result) => err ? next(err) : next(result));
    },

    checkToken : (token, next) => {
        let query = {"token" : token};
        user_model.find(query, (err, doc) => {
            if (err) return next({error : true, message : err});
            if (doc.length > 0) {
                next({error : false, message : doc[0]});
            } else {
                next({error : true, message : "Token is not valid"})
            }
        })
    },

    getUserInfo : (req, next) => {
        let token = req.headers.authorization;
        let query = {"token": token};
        user_model.find(query, (err, doc) => {
            if (err) return next({error : true, message : err})
            if (doc.length > 0) {
                let data = JSON.stringify(doc[0]);
                data = JSON.parse(data);
                next({error : false, message : data})
            } else {
                next({error : true, message : "User was not found"})
            }
        })
    },

    addChat : (data, next) => {
        chat_model.create(data, (err, doc) => err ? next(err) : next(err, doc));
    },

    addChatUser : (data, next) => {
        chat_user_model.create(data, err => err ? next(err) : next());
    },

    getChats : (username, next) => {
        chat_user_model.find({username}, null, {lean:true})
          .then(doc => next(null, doc), err => next(err));
    },

    getChatInfo : (chatIds, next) => {
        const query = {"_id" : {$in : chatIds}};
        chat_model.find(query, null, {lean: true})
          .then(doc => next(null, doc), err => next(err));
    },

    addMessage : (data, next) => {
        message_model.create(data, err => err ? next(err) : next());
    },

    getHistory : (chatId, next) => {
        message_model.find({chatId}, null, {limit : 10, lean : true, sort : {date : -1}})
          .then(doc => {
              _.each(doc, one =>one.date = new Date(one.date * 1000));
              next(null, doc)
          }, err => next(err))
    },

    findChats : next => {
        chat_model.find({}, null, {limit : 10, lean:true})
          .then(doc => next(null, {error : false, doc : doc}), err => next(err));
    }

};

module.exports = mongo;

