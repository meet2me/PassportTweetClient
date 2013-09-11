
/*
 * GET home page.
 */
var date = require("date-extended");
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
	    		console.log("First : ", data._json.created_at);
	    		console.log("Latest : ", data._json.status.created_at);
	    		var avg = getAvg(data._json.created_at, data._json.status.created_at,data._json.statuses_count);
	    		console.log(avg);
	    		res.render('home', {user: data, avg : avg, result :'' });
	    	}
	    });
	}
};

exports.todayTweet = function(req, res){
	dbHandler.getTodayTweet(req.user.id, function(error, result){
    	res.render('home', { user: req.user, result : result});
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

function getAvg(first,last,totalTweets){

	dtA = stringToDate(first);
	dtB = stringToDate(last);
	var diff = date.difference(dtA, dtB, "week");
	console.log("Diff: ", (totalTweets/diff));
	var avg = (totalTweets/diff);
	return (avg.toFixed(2));
}
function stringToDate(s) {
  var b = s.split(/[: ]/g);
  var m = {jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6,
           aug:7, sep:8, oct:9, nov:10, dec:11};

  return new Date(Date.UTC(b[7], m[b[1].toLowerCase()], b[2], b[3], b[4], b[5]));
}
