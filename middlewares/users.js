
const jwt = require("jsonwebtoken");
const platformConfigs = require("../config/config");

const users = {

    generateToken : data => {
        return jwt.sign({
            username : data.username
        }, platformConfigs.jwtSecret);
    },

    decodeToken : data => jwt.verify(data, platformConfigs.jwtSecret)

};

module.exports = users;



