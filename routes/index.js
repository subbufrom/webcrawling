'use strict';
const express = require('express');
const router = express.Router();
const crawl = require('./crawl');

/* GET home page. */
router.use('/crawl', crawl);

module.exports = router;
