const {DataTypes} = require("sequelize")
const cdatabase = require("../config/database")
const User = require("./User")
const Article = require("../models/Article")
 const UserArticle = cdatabase.define("user_article",{
    //id_user:{
    //type:DataTypes.INTEGER,
//     references: {
//         model:'User',
//         key: 'id',
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE'
//     },
//     id_article:{
//         type:DataTypes.INTEGER,
//         references: {
//         model:'Article',
//         key: 'id',
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE'
//     }
},
    {timestamps:false})



module.exports = UserArticle