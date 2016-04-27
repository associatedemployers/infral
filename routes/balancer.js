const redis = require('redis'),
      Promise = require('bluebird'),
      winston = require('winston'),
      httpProxy = require('http-proxy'),
      apiProxy = httpProxy.createProxyServer();

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient();

apiProxy.on('error', (err, req, res) => {
  res.end();
  winston.error(err.stack);
});

module.exports = function ( app ) {
  app.all('/*/*', (req, res) => {
    redisClient.srandmemberAsync('infralTargets', 1)
    .then(target => {
      if ( !target ) {
        return res.status(0).end();
      }

      apiProxy.web(req, res, { target });
    })
    .catch(err => {
      winston.error(err.stack);
      return res.status(503).end();
    });
  });
};
