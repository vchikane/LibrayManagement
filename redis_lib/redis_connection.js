var redis = require('redis');
var client = redis.createClient();
function redis_connection () {
	//return redis singelton object
	if(client){
		return client;
	}else
	{
		client=redis.createClient();
	}
	return client;
}

object = redis_connection();
module.exports = object;