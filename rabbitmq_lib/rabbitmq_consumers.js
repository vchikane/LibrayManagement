// adding to get singleton connection of redis
var client = require('../redis_lib/redis_connection.js');


var amqp = require('amqplib/callback_api');

/* start consumer, which can listen the msgs written by producer for checkout books*/
exports.startCheckoutConsumer = function() {
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
}


/* start consumer, which can listen the msgs written by producer for checkin books*/
exports.startCheckinConsumer = function() {
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
}