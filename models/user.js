const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db.config');

class User extends Model {}

User.init({
    username: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    profileImageUrl: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'User'
});

module.exports = User;
