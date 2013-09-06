
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
		dbHandler.getUserTweets(req.user.id, function(error,data){
	        if(error){
	          console.log("DB Error in printing data: ", error);
	        }
	        tweets = data;
	        // console.log("DAta:", data);
	    });
		console.log("Session:", req.user);
		res.render('home',{ user: req.user, tweets: tweets});
	}
	
  // res.render('index', { title: 'Express' });
};