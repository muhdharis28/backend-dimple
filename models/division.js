// models/division.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db.config');

class Division extends Model {}

Division.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize,
    modelName: 'Division',
});

module.exports = Division;
