const express = require('express'),
      redis = require('redis'),
      Promise = require('bluebird'),
      error = require('./error'),
      pathConfig = require('../config/paths');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient();

module.exports = function ( app ) {
  let targetRouter = express.Router();

  targetRouter.post('/', (req, res) => {
    let t = req.body;
    redisClient.saddAsync(pathConfig.targetStoragePath, t.protocol + '://' + t.host + ':' + t.port)
    .then(() => {
      res.status(201).end();
    })
    .catch(error(res));
  });

  targetRouter.get('/', (req, res) => {
    redisClient.smembersAsync(pathConfig.targetStoragePath)
    .then(targets => res.send({ targets }))
    .catch(error(res));
  });

  app.use('/targets', targetRouter);
};
