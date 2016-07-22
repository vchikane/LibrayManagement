var client = require('../redis_lib/redis_connection.js'); 
function redis_insert(req,res,cb){
	var date =  Math.floor(Date.now()/1000);
	var key_1 = 'ISBN_' + date;
	console.log(key_1);

	obj = {
		'name'        : req.body.name, 
		'description' : req.body.description,
		'checkout'    : 'false'
	};

	//calling redis method to store data
	client.hmset('books', key_1, JSON.stringify(obj), function(err,doc) {
		client.hget('books',key_1,function(err,doc_res){
			res.render('inserted',{book : doc_res});
			if(cb) {
				cb();
			}
		})
		
	});

}

module.exports = redis_insert