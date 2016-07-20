var amqp = require('amqplib/callback_api');

function get_rabbitmq_connection () {

  return {
    publish_msg : function(q,msg){
      amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
          if(err) {
            console.log(err);
          }
          ch.assertQueue(q, {durable: false});
          console.log("queue created");
          console.log("queue name " + q);
          console.log("queue msg " + msg);
          msg_new = new Buffer(msg);
          ch.sendToQueue(q,msg_new);
          console.log("msg written to the respective queue");
        });
          //setTimeout(function() { conn.close(); process.exit(0) }, 500);
      });
    }
  }
};

object = get_rabbitmq_connection();
module.exports = object;