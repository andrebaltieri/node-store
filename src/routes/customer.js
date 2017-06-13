'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/customer-controller');

router.post('/customers', controller.create);

module.exports = router;