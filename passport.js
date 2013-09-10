var fs = require('fs');

var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

var DBHandler = require('./dbHandle.js').DBHandler;
var dbHandler = new DBHandler('localhost', 27017);

var obj = JSON.parse(fs.readFileSync('config/consumerCredentials.json', 'utf8'));
var consumerKey = obj.consumer_key;
var consumerSecret = obj.consumer_secret_key;
var callbackURL = obj.callback;


module.exports =function(passport){

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    dbHandler.findUser(id, done);
  });

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
      data = profile;
      //Fetch Tweets from getTweet module
      require('./getTweets.js').getTweet(token,tokenSecret,function(error){
        if(error){
          console.log("Error Fetching Tweet: ",error);
        }
      });
      console.log("Before findOrCreateUser");
      dbHandler.findOrCreateUser(profile, function(error, user){
        if(error){
          console.log("DB Error : ", error);
        }
        return done(null, user);
      });
      console.log("After findOrCreateUser");
    }
  ));
};
