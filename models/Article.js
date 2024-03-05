const {DataTypes} = require("sequelize")
const cdatabase = require("../config/database")
const User = require("./User")
const Category = require("./Category")
const UserArticle = require("../models/user_article")


const Article = cdatabase.define("Article",{
    id:{type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true},
    brand:DataTypes.STRING,
    model:DataTypes.STRING,
    year:DataTypes.INTEGER,
    price:DataTypes.DECIMAL,
    type:DataTypes.DECIMAL},
    {timestamps:false})




module.exports = Article


