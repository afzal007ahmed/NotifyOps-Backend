const { Sequelize } = require("sequelize");
const { config } = require("../config");

const sequelize = new Sequelize(config.database.url, {
  dialect: config.database.dialect,
  logging : false 
});

module.exports = { sequelize };
