var createError         = require('http-errors');
var express             = require('express');
var path                = require('path');
var cookieParser        = require('cookie-parser');
var logger              = require('morgan');
var debug               = require('debug')('app:server');
var http                = require('http');
var swaggerJSDoc        = require('swagger-jsdoc');
var fs                  = require('fs');
var swaggerUi           = require('swagger-ui-express');
var yaml                = require('js-yaml');
var swaggerDoc          = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../swagger.yaml')));
var ownerRouter         = require('./routes');
var bodyParser          = require('body-parser')
var app = express();

var multipart = require("connect-multiparty");

global.multipartMiddleware = multipart();
app.use(logger('dev'));
app.use(express.json({ limit: "50mb", extended: false }));
//support parsing of application/x-www-form-urlencoded post data
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

//------------------------------------------------ Swagger Stuffs ---------------------------------------

/**
* Swagger Documents
*/

//correcting swagger host and base path
(function (){
  console.log("updating swagger");
  swaggerDoc.host = "localhost:3000";
  swaggerDoc.basePath = '/';
})();

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
// app.use('/',	require('./routes/index.js')); //Call all document API routes

//-------------------------------------------------------------------------------------------------------

app.use('/', ownerRouter); 



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(err);
});

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
