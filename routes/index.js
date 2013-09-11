
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
		console.log("Session:", req.user);
		res.render('home',{ user: req.user, tweets: tweets, result:''});
		});
	}

  // res.render('index', { title: 'Express' });
};
exports.todayTweet = function(req, res){
	dbHandler.getTodayTweet(req.user.id, function(error, result){
    	res.render('home', { user: req.user, result : result });
  	} );

};
exports.getTweets = function(req, res){
	var day = req.body.day;
	var month = req.body.month;
	var year = req.body.year;

	var date = day+month+year;
	console.log("Date == ",date);

	dbHandler.getTweetsByDate(req.user.id, date, function(error, test){
		res.render('home', { user:req.user, test: test, result : '' });
	// });
	// console.log("Result == ",test);
	});
};