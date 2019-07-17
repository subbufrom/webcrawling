'use strict';
const crawl = require('../service/crawlingService');
const startcrawling = async (req, res, next) => {
  try {
    const url = 'https://medium.com';
    crawl.startCrawl(url);
    return res.status(200).json({'message': 'Crawling process has been initiated'});
  } catch (error) {
    console.log('Error occured while crawling ' + error);
    return res.status(500).json(error);
  }
};

const getTheProcess = async (req, res, next) => {
  try {
    const response = await crawl.getTheProcess();
    return res.status(200).json(response);
  } catch (error) {
    console.log('Error occured while crawling ' + error);
    return res.status(500).json(error);
  }
};

module.exports = {startcrawling, getTheProcess};
