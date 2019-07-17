'use strict';
const express = require('express');
const router = express.Router();
const crawl = require('../controllers/crawl');

router
  .get('/load', crawl.startcrawling)
  .get('/status', crawl.getTheProcess);

module.exports = router;
