var express = require('express');
var router = express.Router();
var redis_insert= require('./redis_insert.js')
// adding to get singleton connection of redis
var client = require('../redis_lib/redis_connection.js'); 
console.log("redis connection successfull");

// adding to get singleton connection of rabbitmq
var mq_conn = require('../rabbitmq_lib/rabbitmq_producer.js');
console.log("rabbitmq connection successfull from index.js");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: ' E-Library' });
});

/* GET page to add a new book */
router.get('/addBook', function(req, res) {
	res.render('addbook');
});

/* Insert record into redis hash */
router.post('/addbook/insert', function(req, res) {
	//generating unique key using currect time
	redis_insert(req,res)

});

router.get('/listbooks', function(req, res) {
	client.hgetall("books", function(err, resp) {
		console.log(resp);
		res.render('listbooks', {
			books: resp
		})
	})
});

/* Get Modify Book Details, Page */
router.get('/update_book',function(req,res){
	console.log("edit book")
	key=req.query.u_id;
	console.log(key);
	client.hget('books', key, function(err,data){
		console.log(data)
		//below code will rendor modify details page with all details
		res.render('update',{
			book : data,
			key  : key
		})
	})
});

/* Update User Details */
router.post('/update_book/update', function(req, res) {
	key_1 = req.body.key;
	console.log("key is " + key);
	obj = {
		'name'        : req.body.name, 
		'description' : req.body.description,
	}
	console.log("type of obj " + typeof(obj));
	console.log("value of obj " + obj);
	client.hmset('books', key_1, JSON.stringify(obj), function(err, doc) {
		res.render('updated');
	})
	
});

/* Get Delete User Page */
router.get('/delete_book',function(req,res){
	console.log("delete book")
	key=req.query.u_id;
	client.hget('books', key, function(err,data){
		console.log(data)
		res.render('delete',{
			book : data,
			key  : key
		})
	})
});

/* Delete User */
router.post('/delete_book/delete', function(req, res) {
	key_1 = req.body.key;
	console.log(key_1);
	client.hdel('books', key_1, function() {
		res.render('deleted');
	})
});

/* checkout the books */
router.get('/checkout', function(req, res) {
	client.hgetall("books", function(err, resp) {
		console.log(resp);
		for( i in resp) {
			console.log(JSON.parse(resp[i]));
			var book=JSON.parse(resp[i])
			if(book.checkout!=='false'){
				delete resp[i]
			}
		}
		if(Object.getOwnPropertyNames(resp).length === 0) {
			res.send("Sorry! No books are available, Please try later.");
		} else {
			res.render('booksavailable', {
			books: resp
		  })
		}
	})
});

/* push the key into queue and consumer will consume it, also book will be locked in redis*/
router.get('/checkout/out', function(req, res) {
	key_1 = req.query.u_id;
	console.log("key is " + key_1);
	mq_conn.publish_msg('books_checkout',key_1);
	console.log("data pushed to queue");
	res.render('checkedout');
});


/* checkin the books */
router.get('/checkin', function(req, res) {
	client.hgetall("books", function(err, resp) {
		for( i in resp) {
			console.log(JSON.parse(resp[i]));
			var book=JSON.parse(resp[i])
			if(book.checkout==='false'){
				delete resp[i]
			}
		}
		console.log(resp);
		if(Object.getOwnPropertyNames(resp).length === 0) {
			res.send("No books to return");
		} else {
			res.render('bookslocked', {
			books: resp
		  })
		}
		
	})
});

/* push the key into queue and consumer will consume it, also book will be locked in redis*/
router.get('/checkin/in', function(req, res) {
	key_1 = req.query.u_id;
	console.log("key is " + key_1);
	mq_conn.publish_msg('books_checkin',key_1);
	console.log("data pushed to checkin queue");
	res.render('checkedin');
});

module.exports = router;