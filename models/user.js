// models/user.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db.config');
const Division = require('./division');

class User extends Model {}

User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.ENUM('admin', 'delegation_verificator', 'delegation_handler')
    },
    description: {
        type: DataTypes.TEXT
    },
    profileImageUrl: {
        type: DataTypes.STRING
    },
    divisionId: {
        type: DataTypes.INTEGER,
        references: {
            model: Division,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'User'
});

module.exports = User;
