var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var async = require('async');
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

DBHandler.prototype.saveTweets = function(tweets,callback){
  this.db.collection('tweets',function(error,tweet_collection) {
    var userId = '';
    var tweetId = '';
    var tweet = '';
    if( error ) {
      callback(error);
    }
    else {
      async.each(tweets,function(item,callback){
        item._id = item.id_str;
        tweet_collection.insert(item,function(){
          callback(null,tweets);
        });
        },function(error){
          if(error){
            console.log("Error Saving Tweets:",error);
          }
        }
      );
    }
    console.log("Tweets saved.");
  });
};

DBHandler.prototype.getLatestTweetId = function(userId, callback){
  this.db.collection('tweets',function(error,tweet_collection){
    if(error){
      console.log(error);
      if(error.message.indexOf('unique')) {
        // ignore
        console.log('Duplicate');
      } else {
        return callback(error);
      }
    }
    //tweet_collection.findOne({userId: userId},{tweetId: 1, _id: 0},callback);
    var options = {
      "limit": 1,
      "sort": {'id': -1}
    }
    tweet_collection.findOne({ 'user.id': userId}, {id:1},options,callback);
    // tweet_collection.find({'user.id':userId}, {id:1}, options).toArray(function(error, result){
    //           console.log("result:",result);
    // });
    console.log("Inside getLatestTweetId");
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

DBHandler.prototype.getUserTweets = function(profile, callback){
  var self = this;
  var tweets = '';
  this.db.collection('tweets',function(error,tweet_collection){
    if(error){
      console.log(error);
      if(error.message.indexOf('unique')) {
        // ignore
        console.log('Duplicate');
      } else {
        return callback(error);
      }
    }
    tweet_collection.find({'user.id': profile.id}).toArray(function(err, results){
      callback(null, results);
    });
  });
};

exports.DBHandler = DBHandler;