var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var tweet='';
var created_at='';
var userId = '';

DBHandler = function(host, port) {
  this.db= new Db('tweetstats', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(error){
  	if(error){
  		console.log('Error : ', error);
  	} else {
  		console.log('Database connected.');
  	}
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
            //new entry
            //for(var i =0;i< tweets.length;i++){
              tweet_collection.insert({userId: userId, text: tweets, totalTweets: counter, latestTweetId: latestTweetId},function(){
              callback(null,tweets);
              });
            //}
          }
          else{
            callback(null,tweets);
          }
        }
      }); 
    }
  });
};

DBHandler.prototype.updateTweets = function(tweets,callback){
  this.db.collection('tweets',function(error,tweet_collection){
    var i=tweets.length;
    var counter= 0;
    var userId = tweets[0].user.id;
    var latestTweetId = tweets[0].id_str;
    if(error){
      callback(error);
    }
    else{
      for(var i=0;i<tweets.length;i++){
        tweet = tweets[i].text;
        created_at = tweets[i].created_at;
        counter+=1;          
      }
      tweet_collection.update({userId: userId},
        { $set: {
          text: tweets,
          latestTweetId: latestTweetId,
          totalTweets: counter
        } 
      });   
      console.log("Tweets Updated.");
    }
  });
};

DBHandler.prototype.getLatestTweetId = function(userId, callback){
  this.db.collection('tweets',function(error,tweet_collection){
    if(error){
      return callback(error);
    }
    //tweet_collection.findOne({userId: userId},{latestTweetId: 1, _id: 0},callback);
    tweet_collection.findOne({userId: userId},{latestTweetId: 1, _id: 0},function(error,result){
      if(result){
        return callback;
      }
      else{
        console.log("Error:",error);
      }
    });
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