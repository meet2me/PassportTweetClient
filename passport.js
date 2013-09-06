var fs = require('fs');

var TwitterStrategy = require('passport-twitter').Strategy;


var obj = JSON.parse(fs.readFileSync('./config/consumerCredentials.json', 'utf8'));
var consumerKey = obj.consumer_key;
var consumerSecret = obj.consumer_secret_key;
var callbackURL = obj.callback;


module.exports =function(passport){
	passport.use(new TwitterStrategy({
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    callbackURL: callbackURL
  	},
  	function(token, tokenSecret, profile, done) {
    // NOTE: You'll probably want to associate the Twitter profile with a
    //       user record in your application's DB.
    var user = profile;
    return done(null, user);
  	}
));
};
