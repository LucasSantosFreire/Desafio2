const Sequelize = require("sequelize");
const db = require("../config/database.js");
const User = require("../models/User");
const Recipient = require("../models/Recipient");

const connection = new Sequelize(db);

User.init(connection);
Recipient.init(connection);

module.exports = connection;
