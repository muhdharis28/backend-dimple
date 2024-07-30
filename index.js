const express = require('express');
const cors = require('cors');
const path = require('path');
const port = 3800;

const sequelize = require('./db.config');
sequelize.sync();

const userEndpoint = require('./routes/user');
const divisionEndpoint = require('./routes/division');
const eventEndpoint = require('./routes/event');
const responseRoutes = require('./routes/response');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads-event', express.static(path.join(__dirname, 'uploads-event')));
app.use('/uploads-responses', express.static(path.join(__dirname, 'uploads-responses')));

app.use('/response', responseRoutes);
app.use('/user', userEndpoint);
app.use('/division', divisionEndpoint);
app.use('/event', eventEndpoint);

const server = app.listen(port, () => console.log(`running server on port ${port}`));

module.exports = server;
