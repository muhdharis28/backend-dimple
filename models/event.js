const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db.config');
const User = require('./user'); // Adjust the path as necessary
const Division = require('./division'); // Adjust the path as necessary

class Event extends Model {}

Event.init({
    fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    toDivisionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Division,
            key: 'id'
        }
    },
    toPersonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    descriptionImageUrl: {
        type: DataTypes.STRING,
    },
    eventFileUrls: {
        type: DataTypes.JSON,
    },
    status: {
        type: DataTypes.ENUM,
        values: [
            'Perlu Verifikasi',
            'Verifikasi Ditolak',
            'Perlu Konfirmasi Penerima',
            'Penerima Setuju',
            'Ditolak',
            'Disetujui',
        ],
        defaultValue: 'Perlu Verifikasi',
    },
    rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Event',
});

module.exports = Event;