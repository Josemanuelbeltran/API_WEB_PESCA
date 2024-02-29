const {DataTypes, json} = require("sequelize")
const cdatabase = require("../config/database")

const Category = cdatabase.define("Category",{name:DataTypes.STRING},{timestamps:false})


module.exports = Category