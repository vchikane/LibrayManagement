var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

// adding to get singleton connection of redis
var client = require('./redis_lib/redis_connection.js'); 

/* start consumer, which can listen the msgs written by producer for checkout books*/
var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    if(err) {
      console.log(err);
    }
    q_01 = "books_checkout";
    ch.assertQueue(q_01, {durable: false});
    console.log("checkout queue created");
    ch.consume(q_01, function(msg) {
      key_1 = msg.content.toString();
      client.hget('books', key_1, function(err, resp) {
        if(resp !== null) {
          console.log("response using consumed key" + resp);
          jsonData = JSON.parse(resp);
          obj = {
            'name'        : jsonData.name, 
            'description' : jsonData.description,
            'checkout'    : 'true'
          }
          client.hmset('books', key_1, JSON.stringify(obj), function(err, doc) {
            console.log("Book Locked");
          })
        }
      });
    });
  });
});


/* start consumer, which can listen the msgs written by producer for checkin books*/
var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    if(err) {
      console.log(err);
    }
    q_02 = "books_checkin";
    ch.assertQueue(q_02, {durable: false});
    console.log("checkin queue created");
    ch.consume(q_02, function(msg) {
      key_1 = msg.content.toString();
      client.hget('books', key_1, function(err, resp) {
        if(resp !== null) {
          console.log("response using consumed key" + resp);
          jsonData = JSON.parse(resp);
          obj = {
            'name'        : jsonData.name, 
            'description' : jsonData.description,
            'checkout'    : 'false'
          }
          client.hmset('books', key_1, JSON.stringify(obj), function(err, doc) {
            console.log("Book Unlocked");
          })
        }
      });
    });
  });
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.use(function() {
  mq_conn.consume_msg('books_checkout');
});


module.exports = app;