var http = require('http');
var express = require('express');
 
var getRequests = require('./getRequests.js');
 
var app = express();
require('./appConfiguration')(app);

var DBHandler = require('./dbHandle.js').DBHandler;
var dbHandler= new DBHandler('localhost', 27017);
 
//Below snippt will authorize an app and will return to callback with
//before used token and verifier
app.get('/', function(req, res) {
     
    // TODO: Check if access_token is available in session
    if(!req.session.access_token){ 
        getRequests.getToken(req,res);
    } else {
    //(if available)
    // TODO: Fetch latest tweets, save them in session and display
        getRequests.getTweet(req,res);
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
}).on('error',function(error){
	console.log("Error On:" ,error);
});



app.get('/logout', function(req, res){
  if(req.session) {
    req.session.access_token = null;
    res.clearCookie('access_token');
    req.session.destroy(function() {});
  }
  res.redirect('/localhost');
});
