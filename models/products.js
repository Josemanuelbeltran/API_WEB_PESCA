const {DataTypes} = require("sequelize")
const cdatabase = require("../config/database")

const Product = cdatabase.define("Products",{marca:DataTypes.STRING,modelo:DataTypes.STRING,anio:DataTypes.INTEGER,id_categoria:DataTypes.INTEGER,precio:DataTypes.DECIMAL},{timestamps:false})

module.exports = Product


