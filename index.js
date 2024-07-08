const express = require('express')
const cors = require('cors')
const port = 3800

const path = require('path');
const sequelize = require('./db.config')
sequelize.sync()

const userEndpoint = require('./routes/user')
// const cashEndpoint = require('./routes/cash')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/user', userEndpoint)
// app.use('/cash', cashEndpoint)

app.listen(port,  () => console.log(`running server on port ${port}`))