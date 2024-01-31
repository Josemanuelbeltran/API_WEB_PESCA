const { Sequelize } = require('sequelize');

const cdatabase = new Sequelize({
    dialect: 'mysql',
    host:"localhost",
    username:"root",
    password:"1234",
    database:"web_pesca",
    timezone: "Europe/Madrid",
    dialectOptions: {
        timezone: "local",
    }})

module.exports = cdatabase;