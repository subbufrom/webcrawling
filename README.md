# Web-Crawling
## About

  - Crawl a given website recursively with given cocurrent requests
  
## TechStack
```
Platform: Node 8 and above
Database: Postgress
Framework: Express
````

Install the dependencies and devDependencies and start the server.

```sh
$ npm i
$ npm start
```
Application will be up and runnig on the port 3001

### Apis exposed
 - To Initiate the crawling
 ```
 curl -XGET http://localhost:3001/rento/crawl/load/
 response : {
    "message": "Crawling process has been initiated"
}
 ```
 - To See the progress
 ```
 curl -XGET http://localhost:3001/rento/crawl/status/
 response : {
    "totalFound": 0,
    "totalProcessed": 0,
    "process": "Crawling is not yet initiated",
    "data": []
}
 ```
 
 ### Application is dockerized
