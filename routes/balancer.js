const redis = require('redis'),
      Promise = require('bluebird'),
      winston = require('winston'),
      httpProxy = require('http-proxy'),
      apiProxy = httpProxy.createProxyServer(),
      pathConfig = require('../config/paths');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient();

apiProxy.on('error', (err, req, res) => {
  res.status(502).end();
  winston.error(err.stack);
});

module.exports = function ( app ) {
  app.all('/*', (req, res) => {
    redisClient.srandmemberAsync(pathConfig.targetStoragePath, 1)
    .then(targets => {
      let target = targets[0];

      if ( !target ) {
        winston.debug('Unable to find target');
        return res.status(503).end();
      }

      winston.debug('Directing request to target', target);
      apiProxy.web(req, res, { target });
    })
    .catch(err => {
      winston.error(err);
      res.status(503).end();
    });
  });
};
