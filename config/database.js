const { Sequelize } = require('sequelize');
require('dotenv').config({path:'.env'})
const cdatabase = new Sequelize({
    dialect: 'mysql',
    host:process.env.DB_HOST,
    username:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    timezone: "Europe/Madrid",
    dialectOptions: {
        timezone: "local",
    },
    logging:false})

module.exports = cdatabase;