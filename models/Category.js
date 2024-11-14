const { DataTypes } = require("sequelize");
const cdatabase = require("../config/database");

const Category = cdatabase.define("Category", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING
}, {
    timestamps: false
});

module.exports = Category;
