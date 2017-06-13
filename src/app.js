'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config');
const mongoose = require('mongoose');

// Carrega os Models
const Customer = require('./models/customer');

// Carrega as Rotas
const index = require('./routes/index');
const customer = require('./routes/customer');

// Inicializa a App
const app = express();

// Connecta ao banco
mongoose.connect(config.connectionString);

// Configurações
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Habilita o CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Definições das Rotas
app.use('/', index);
app.use('/', customer);

module.exports = app;  