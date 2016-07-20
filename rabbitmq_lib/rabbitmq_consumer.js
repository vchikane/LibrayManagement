var amqp = require('amqplib/callback_api');

function get_rabbitmq_connection () {

  return {
    consume_msg : function(q) {
      amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
          if(err) {
            console.log(err);
          }
          ch.assertQueue(q, {durable: false});
          console.log("queue created");
          console.log("queue name " + q);
          ch.consume(q, function(msg) {
            console.log("message consumed " + msg);
          });
        });
          //setTimeout(function() { conn.close(); process.exit(0) }, 500);
      });
    }
  }
};

object = get_rabbitmq_connection();
module.exports = object;