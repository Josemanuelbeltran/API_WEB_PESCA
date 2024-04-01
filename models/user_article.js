const {DataTypes} = require("sequelize")
const cdatabase = require("../config/database")
const User = require("./User")
const Article = require("../models/Article")
 const UserArticle = cdatabase.define("user_article",{
},
    {timestamps:false})



module.exports = UserArticle