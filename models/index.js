const sequelize = require('../db.config');
const Event = require('./event');
const Response = require('./response');
const User = require('./user');
const Division = require('./division');

// Define associations
User.belongsTo(Division, { foreignKey: 'divisionId', as: 'division' });
Event.hasMany(Response, { foreignKey: 'eventId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Response, { foreignKey: 'userId' });
Response.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Response.belongsTo(Event, { foreignKey: 'eventId', as: 'event', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Event.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
Event.belongsTo(User, { as: 'toPerson', foreignKey: 'toPersonId' });
Event.belongsTo(Division, { as: 'toDivision', foreignKey: 'toDivisionId' });

module.exports = {
    Event,
    Response,
    User,
    Division,
    sequelize
};
