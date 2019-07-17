'use strict';
const {
  Crawl
} = require('../models');
const cheerio = require('cheerio');
const request = require('request');
const util = require('util');

let concurrent;
let todo = [];
let initiated = false;
const running = [];
const complete = [];
const completedUrls = {};

const startCrawl = async (url) => {
  concurrent = 5;
  todo = [url];
  initiated = true;
  try {
    recursiveCall();
    return;
  } catch (error) {
    console.log('Error occured ' + error);
    return;
  }
};

const recursiveCall = async () => {
  while (isConcurrencyMet()) {
    const currentUrl = todo.shift();
    if (!completedUrls[currentUrl] && isValidUrl(currentUrl) && isMediumUrl(currentUrl)) {
      completedUrls[currentUrl] = true;
      running.push(currentUrl);
      try {
        const taskUrls = await makeApiCall(currentUrl);

        if (taskUrls.length > 0) {
          try {
            const uniqueUrls = await removeDuplicateUrls(taskUrls, completedUrls);
            todo = [...todo, ...uniqueUrls];
            complete.push(running.shift());

            if (todo.length == 0 || complete.length == 40) {
              saveInDb(complete);
              complete.length = 0;
            }
            recursiveCall();
          } catch (error) {
            saveInDb(complete);
          }
        } else {
          todo = [...todo, ...taskUrls];
          complete.push(running.shift());

          if (todo.length == 0 || complete.length == 40) {
            saveInDb(complete);
            complete.length = 0;
          }
          recursiveCall();
        }
      } catch (error) {
        recursiveCall();
        saveInDb(complete);
      }
    }
  }
  if (todo.length == 0) {
    console.log('Its done');
  }
};

const desieredUrlForm = (urlsArray, callback)=>{
  const urlObj = [];
  urlsArray.map(url=>{
    const splitedUrl = url.split('?');
    const obj = {};
    obj.url = splitedUrl[0];
    splitedUrl.shift();
    obj.parameters = splitedUrl.map(urlParams=>{
      return urlParams.split('=')[0];
    });
    urlObj.push(obj);
  });
  callback(null, urlObj);
};

const waitForUrlsToGetParsed = util.promisify(desieredUrlForm);

const saveInDb = async (completedUrls) => {
  const arrays = await waitForUrlsToGetParsed(completedUrls);

  for (let i = 0; i < arrays.length; i++) {
    const element = arrays[i];
    const isFound = await Crawl.findAll({
      where: {
        url: element.url
      }
    });
    if (isFound && !(isFound.length > 0)) {
      const data = {
        url: element.url,
        params: element.parameters,
        referenceCout: 1
      };
      await Crawl.create(data);
    } else if (isFound && isFound[0]) {
      isFound[0].referenceCout++;
      for (let i = 0; i < element.parameters.length; i++) {
        if (isFound[0].params.indexOf(element.parameters[i]) == -1) isFound[0].params.push(element.parameters[i]);
      }
      await Crawl.update({
        params: isFound[0].params,
        referenceCout: isFound[0].referenceCout
      }, {
        where: {
          id: isFound[0].id
        }
      });
    }
  }
};

const removeDuplicateUrls = (taskUrls, completedUrlsObject) => {
  return new Promise(async (resolve, reject) => {
    let updatedUrls = [];
    updatedUrls = taskUrls.filter(url => {
      const u = url;
      if (completedUrlsObject[u] != true && isValidUrl(url)) {
        return true;
      }
      return false;
    });
    resolve(updatedUrls);
  });
};

const isConcurrencyMet = () => (running.length < concurrent && todo.length);

const makeApiCall = (url) => {
  return new Promise((resolve, reject) => {
    const urlSet = new Set();
    const options = {
      url,
      methos: 'GET'
    };
    request(options, (err, response, body) => {
      if (err) reject(err);
      else {
        const parsedBody = cheerio.load(body);
        const links = parsedBody('a');
        for (let i = 0; i < links.length; i++) {
          const hre = parsedBody(links[i]).attr('href');
          if (isMediumUrl(hre) && isValidUrl(hre)) {
            urlSet.add(hre);
          }
        }
        resolve([...urlSet]);
      }
    });
  });
};

const isMediumUrl = (url) => {
  let pattern = 'medium.com';
  pattern = new RegExp(pattern);
  return pattern.test(url);
};

const isValidUrl = (url) => {
  const pattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
  return pattern.test(url);
};

const getTheProcess = async () => {
  const data = await Crawl.findAll();
  const process = initiated ? todo.length == 0 ? 'Done' : 'Inprocess' : 'Crawling is not yet initiated';
  return {
    'totalFound': todo.length,
    'totalProcessed': data.length,
    process,
    data
  };
};

module.exports = {
  startCrawl,
  getTheProcess
};
