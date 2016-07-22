var chai = require('chai');
var should = chai.should();
var redis_insert = require('./redis_insert.js');

describe('tests', function(){
    describe('testFunction', function(){
      	req={
      		body : {
      			name : "abc",
      			description : "xyz"
      		}
      	}

      	function response(){
      		this.page='';
      		this.obj=null;
      		this.render=function(page,obj){
      			this.page=page;
      			this.obj=obj
      		}
      	}

      	var res= new response();
	
    	it('inserted', function(){
    	 	redis_insert(req,res,function(){
    		console.log(">>>>>>>>>>>")
		 	console.log(res)
		 	console.log(">>>>>>>>>>>bbbb")
    	 		res.page.should.equal('inserted');
	    	})
		})


    	it('abc', function(){
    	 	redis_insert(req,res,function(){
	    		res.obj.book.name.should.equal('abc');
	    	})
		})

	});
})