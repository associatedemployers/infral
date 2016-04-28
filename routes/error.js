const winston = require('winston');

module.exports = function errorHandler ( res ) {
  return (err, user) => {
    res.status(user ? 400 : 500).send(err.message);
    winston.error(err);
  };
};
