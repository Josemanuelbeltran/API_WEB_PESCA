const {DataTypes} = require("sequelize")
const cdatabase = require("../config/database")
//const Article = require("./Article")
const UserArticle = require("./user_article")

const User = cdatabase.define("User",{
    id:{type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true},
    name:DataTypes.STRING,
    password:DataTypes.STRING,
    email:DataTypes.STRING,
    photo:DataTypes.STRING,
    phone_number:DataTypes.STRING
    },{timestamps:false})

//User.belongsToMany(Article, { through:UserArticle });

module.exports = User