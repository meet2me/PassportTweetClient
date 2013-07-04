var http = require('http');
var express = require('express');

var getRequests = require('./getRequests.js');

var app = express();
require('./appConfiguration')(app);


//Below snippt will authorize an app and will return to callback with
//before used token and verifier
app.get('/', function(req, res) {
	
	// TODO: Check if access_token is available in session
	if(!req.session.access_token){
	//USAGE : getRequests.getTOken(req,res)  
		getRequests.getToken(req,res);
	} else {
	// else (if access_token is available)
		getRequests.getTweet(req,res);
	// TODO: Fetch latest tweets, save them in session and display
	}
});

//After getting response from  call back ,retrive parameters
//and redirect to https://api.twitter.com/oauth/access_token 
app.get('/callback', function(req,res){
	//Getting request parameters
	getRequests.getAccessToken(req,res);
});
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});