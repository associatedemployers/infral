const express = require('express'),
      redis = require('redis'),
      Promise = require('bluebird'),
      winston = require('winston');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient();

module.exports = function ( app ) {
  let targetRouter = express.Router();

  targetRouter.post('/', (req, res) => {
    let t = req.body;
    redisClient.saddAsync(t.protocol + '://' + t.host + ':' + t.port)
    .then(() => {
      res.status(201).end();
    })
    .catch(err => {
      res.status(500).send(err);
      winston.error(err.stack);
    });
  });

  app.use('/targets', targetRouter);
};
