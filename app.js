var http = require('http');
var path = require('path');
var https = require('https');
var fs = require('fs');
var express = require('express');

var passport = require('passport');
var app = express();
require('./configureApp')(app);
var TwitterStrategy = require('passport-twitter').Strategy;

var obj = JSON.parse(fs.readFileSync('consumerCredentials.json', 'utf8'));
var consumerKey = obj.consumer_key;
var consumerSecret = obj.consumer_secret_key;
var callbackURL = obj.callback;

var DBHandler = require('./dbHandle.js').DBHandler;
var dbHandler= new DBHandler('localhost', 27017);
var data ='';

passport.use(new TwitterStrategy({
	consumerKey: consumerKey,
   	consumerSecret: consumerSecret,
   	callbackURL: callbackURL
  	},
  	function(token, tokenSecret, profile, done) {
    //DB
      delete profile._raw;
      profile.access_token = token;
      profile.token_secret = tokenSecret;
      //data = JSON.parse(profile);
      data=profile;
      console.log("Data :",data);
      //console.log("Profile: ",profile);
      dbHandler.findOrCreateUser(profile, function(error, user){
        if(error){
          console.log("DB Error : ", error);
        }
        return done(null, user);
      });
  	}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  //User.findById(id, function(err, user) {
  dbHandler.findUser(id, done);
});

app.get('/',function(req, res) {
    res.send('<html><body><a href="/auth/twitter">Sign in with Twitter</a></body></html>');
 });

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/showTimeline',
                                     failureRedirect: '/login' }));

app.get('/showTimeline',function(req,res){
  res.render('home.jade',{data : data});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
