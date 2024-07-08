const {Sequelize } = require('sequelize')

const sequelize = new Sequelize('dimple','root','',{
    dialect: 'mysql',
    host : 'localhost'
})

module.exports = sequelize