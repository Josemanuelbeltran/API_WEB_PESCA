const datadb = require('../config/database')

const User = require("./User");
const Article = require("./Article");
const UserArticle = require("./user_article");
const Category = require("./Category")


exports.startbd = async function(){

    // Define las relaciones entre los modelos
    User.belongsToMany(Article, { through: UserArticle,foreignKey:"id_user"});
    Article.belongsToMany(User, { through: UserArticle,foreignKey:"id_article"});
    Article.belongsTo(Category,{foreignKey:"id_category"})

    try{
        await datadb.authenticate()
    }catch(error){
        console.log(error)
    }


}

