const {DataTypes} = require("sequelize")
const cdatabase = require("../config/database")

const User = cdatabase.define("User",{name:DataTypes.STRING,password:DataTypes.STRING,email:DataTypes.STRING},{timestamps:false})

module.exports = User