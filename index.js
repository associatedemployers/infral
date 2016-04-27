const cluster = require('cluster'),
      os      = require('os');

var express  = require('express'),
    winston  = require('winston'),
    chalk    = require('chalk'),
    logLevel = process.env.environment === 'development' ? 'debug' : 'info';

winston.level = logLevel;

var app = require('./app');
require('./config/mongoose').init();

const port = process.env.INFRAL_PORT || 4555;

if ( cluster.isMaster ) {
  var workers = [];

  os.cpus().forEach((cpu, i) => {
    let boot = num => {
      workers[num] = cluster.fork();
      workers[num].on('exit', () => {
        winston.error(chalk.bgRed('Worker died. :( RIP Worker', num, 'on core #' + i + '. Rebooting...'));
        boot(num);
      });
    };

    boot(i);
  });
} else {
  winston.info(chalk.dim('[', cluster.worker.id, '] Starting infral worker...'));
  process.title = 'INFRAL Balance Worker - ' + cluster.worker.id + ' - Node.js';

  app.registerModels();

  app.init(express()).listen(port, () => {
    winston.info(chalk.dim('[', cluster.worker.id, '] Worker listening on port:', port));
  });
}
