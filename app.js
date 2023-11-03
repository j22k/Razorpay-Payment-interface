// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var db = require('./config/connection');
// var userHelpers = require('./helpers/userHelpers');
// const session = require('express-session');
// var indexRouter = require('./routes/index');
// const bodyParser = require('body-parser');
// const Handlebars = require('handlebars');
// var app = express();
// const multer = require('multer');
// const upload = multer(); // Initialize multer



// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');
// app.use(bodyParser.json())
// app.use(upload.none());

// app.use(session({secret:"key",cookie:{maxAge:3600000}}))
// // Database connection
// db.connectToDatabase()
// //superadmin
// // Define routes
// app.use('/', indexRouter);
// // Define other routes using app.use, e.g., app.use('/admin', adminRouter);

// // Catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // Error handler
// app.use(function (err, req, res, next) {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.render('error'); // Make sure you have an error view (e.g., error.hbs) in your 'views' directory.
// });

// module.exports = app;

// app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var userHelpers = require('./helpers/userHelpers');
const session = require('express-session');
var indexRouter = require('./routes/index');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
var app = express();
const multer = require('multer');
const upload = multer(); // Initialize multer

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(upload.none());

app.use(session({ secret: "key", cookie: { maxAge: 3600000 } }));

// Define routes
app.use('/', indexRouter);
// Define other routes using app.use, e.g., app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error'); // Make sure you have an error view (e.g., error.hbs) in your 'views' directory.
});

// Start the server
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Normalize a port into a number, string, or false.
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

// Event listener for HTTP server "error" event.
function onError(error) {
  // ...
}

// Event listener for HTTP server "listening" event.
function onListening() {
  // ...
}

