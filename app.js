const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const router = require('./router/index');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

module.exports = app;