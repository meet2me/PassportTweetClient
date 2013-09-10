
/*
 * GET home page.
 */
var DBHandler = require('../dbHandle.js').DBHandler;
var dbHandler = new DBHandler('localhost', 27017);

exports.index = function(req, res){
  	
	var data ='';
	var tweets = '';

	if(!req.isAuthenticated()){
		res.render('getLogin');
	}
	else{
	    dbHandler.findUser(req.user.id, function(error,data){
	    	if(error){
	    		console.log("DB Error : ", error);
	    	}
	    	else{
	    		res.render('home', {user: data, title: 'Home Statistics'});
	    	}
	    });
	}
};