const { DataTypes } = require("sequelize");
const cdatabase = require("../config/database");
const User = require("./User");
const Category = require("./Category");

const Article = cdatabase.define("Article", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    brand: DataTypes.STRING,
    model: DataTypes.STRING,
    year: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    type: DataTypes.STRING,  // Cambié a STRING, ya que no parece un campo numérico.
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    category_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'id'
        }
    }
}, {
    timestamps: false
});

// Definir las relaciones
//Article.belongsTo(User, { foreignKey: 'user_id' });
Article.belongsTo(Category, { foreignKey: 'category_id' });

console.log(User);     
console.log(Category);

module.exports = Article;
