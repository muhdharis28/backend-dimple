const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db.config');
const Event = require('./event');
const User = require('./user');

class Response extends Model {}

Response.init({
    responseText: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    responseImageUrl: {
        type: DataTypes.STRING,
    },
    responseFileUrls: {
        type: DataTypes.JSON,
    },
    eventId: {
        type: DataTypes.INTEGER,
        references: {
            model: Event, // Reference the Event model
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Response',
});

module.exports = Response;