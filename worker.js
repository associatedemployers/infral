var bodyParser = require('body-parser'),
    globSync   = require('glob').sync,
    routes     = globSync('./routes/*.js', { cwd: __dirname }).map(require),
    cluster    = require('cluster'),
    winston    = require('winston'),
    chalk      = require('chalk'),
    morgan     = require('morgan'),
    version    = require('./package.json').version,
    logLevel   = process.env.logLevel ? process.env.logLevel : process.env.environment === 'development' ? 'debug' : 'info';

winston.level = logLevel;

const logRoute = process.env.environment === 'test' ? process.env.verboseLogging : true;

exports.init = function ( app ) {
  winston.debug(chalk.dim('Setting server options...'));

  app.enable('trust proxy');

  if ( cluster.worker ) {
    app.set('worker', cluster.worker.id);
  }

  winston.debug(chalk.dim('Setting up middleware...'));

  if ( logRoute ) {
    app.use(morgan('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    if ( app.settings.worker ) {
      res.set('X-INFRAL-WORKER', app.settings.worker);
      winston.debug(chalk.dim('Request served by worker', app.settings.worker));
    }

    res.set('X-INFRAL-Version', version);
    res.set('X-Powered-By', 'Associated Employers');

    next();
  });

  winston.debug(chalk.dim('Constructing routes...'));
  routes.forEach(route => route(app));

  winston.debug(chalk.dim('Worker', app.settings.worker, 'initialization complete.'));

  return app;
};
