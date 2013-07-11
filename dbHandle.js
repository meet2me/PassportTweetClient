var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var tweet='';
var created_at='';
var userId = '';

DBHandler = function(host, port) {
  this.db= new Db('tweetDb', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(error){
  	if(error){
  		console.log('Error : ', error);
  	} else {
  		console.log('Database connected.');
  	}
  	});
};

DBHandler.prototype.getCollection = function(callback) {
	// body...
	this.db.collection('tweets',function(error, tweet_collection) {
    if( error ) callback(error);
    else callback(null, tweet_collection);
  });
};

DBHandler.prototype.saveTweets = function(tweets,callback){
	this.db.collection('tweets',function(error,tweet_collection) {
    var clubTweet=[];
    var i=tweets.length;
    var counter= 0;
    var userId = '';
    var latestTweetId = '';
    if( error ) {
      callback(error);
      }
    else {
      for(var i =0;i< tweets.length;i++){
        tweet = tweets[i].text;
        created_at = tweets[i].created_at;
        counter+=1;
        userId = tweets[0].user.id;
        latestTweetId = tweets[0].id_str;
        //console.log("DB Tweet: ",tweet);
      }
      tweet_collection.findOne({userId: userId},function(error,id){
        if(error) {console.log("Error: ",error);}
        else{
          if(!id){
            //for(var i =0;i< tweets.length;i++){
              tweet_collection.insert({userId: userId, text: tweets, totalTweets: counter, latestTweetId: latestTweetId},function(){
              callback(null,tweets);
              });
            //}
          }
          else{
            /*if(){
              //if currrent tweet-id > latestTweet-id of DB
              //then fetch more 200 tweets
            }
            else{
              callback(null,tweets);
            }*/  
            callback(null,tweets);
          }
        }
      }); 
    }
  });
};

DBHandler.prototype.saveToken = function(profile, callback){
  this.db.collection('user', function(error, user_collection) {
    if(error) { return callback(error); }
    user_collection.insert(profile, function(error){
      if(error) { return callback(error); }
      callback(null, profile);
    });
  });
};

DBHandler.prototype.findUser = function(id, callback){
  var self = this;
  this.db.collection('user',function(error, user_collection){
    if(error) { return callback(error); }
    user_collection.findOne({id: id}, callback);
  });
};

DBHandler.prototype.findOrCreateUser = function(profile, callback){
  var self = this;
  this.db.collection('user',function(error, user_collection){
    if(error) { return callback(error); }
    user_collection.findOne({id: profile.id},function(error, user){
      if(error) { return callback(error); }

      if(!user) {
        self.saveToken(profile, callback);

      } else {
        callback(null, user);
      }
    });
  });
};
exports.DBHandler = DBHandler;