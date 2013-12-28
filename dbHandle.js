var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var async = require('async');
var created_at='';
var userId = '';

var DBHandler = function(host, port) {
  this.db= new Db('tweetDb', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(error){
  	if(error){
  		//console.log('Error : ', error);
  	} else {
  		//console.log('Database connected.');
  	}
  });
};
function parseTwitterDate(text) {
  var date = new Date(Date.parse(text)).toLocaleDateString();
  return date;
}
DBHandler.prototype.saveTweets = function(tweets,callback){
  this.db.collection('tweets',function(error,tweet_collection) {
    userId = '';
    if( error ) {
      callback(error);
    }
    else {
      async.each(tweets,function(item,callback){
        item._id = item.id_str;

        var date = parseTwitterDate(item.created_at);
        item.tweetDate = new Date(date);

        tweet_collection.insert(item,function(){
          callback(null,tweets);
        });
        },function(error){
          if(error){
            //console.log('Error Saving Tweets:',error);
          }
        }
      );
    }
    //console.log('Tweets saved.');
  });
};

DBHandler.prototype.getLatestTweetId = function(userId, callback){
  this.db.collection('tweets',function(error,tweet_collection){
    if(error){
      //console.log(error);
      if(error.message.indexOf('unique')) {
        // ignore
        //console.log('Duplicate');
      } else {
        return callback(error);
      }
    }
    //tweet_collection.findOne({userId: userId},{tweetId: 1, _id: 0},callback);
    var options = {
      "limit": 1,
      "sort": {'id': -1}
    };
    tweet_collection.findOne({ 'user.id': userId}, {id:1},options,callback);
    //console.log("Inside getLatestTweetId");
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
      //console.log('profile status id: ', profile._json.status.id);
      if(!user) {
        self.saveToken(profile, callback);

      } else {
        //console.log('Profile:', user._json.status.id);
        if(profile._json.status.id > user._json.status.id){
          console.log("Need to update profile");
          user_collection.update({id: profile.id}, profile); 
        }
        callback(null, user);
      }
    });
  });
};

DBHandler.prototype.getUserTweets = function(userId, callback){
  this.db.collection('tweets',function(error,tweet_collection){
    if(error){
      //console.log(error);
      if(error.message.indexOf('unique')) {
        // ignore
        //console.log('Duplicate');
      } else {
        return callback(error);
      }
    }
    //console.log("UserId:", userId);
    tweet_collection.find({'user.id': userId}).toArray(function(err, results){
      callback(null, results);
    });
  });
};


DBHandler.prototype.getTodayTweet = function(userId, callback){
  this.db.collection('tweets',function(error,tweet_collection){
    if(error){
      //console.log(error);
      if(error.message.indexOf('unique')) {
        // ignore
        //console.log('Duplicate');
      } else {
        return callback(error);
      }
    }
    //console.log("UserId:", userId);
    var dateformat = require("dateformat");
    var date = new Date();
    //console.log("date = = ",date);

    var today = dateformat(new Date(),"ddd mmm d HH:MM:ss +0000 yyyy");
    //console.log("Today s date = = ",today);
    var yesterday = dateformat(new Date(date.getTime() - (24 * 60 * 60 * 1000)),"ddd mmm d HH:MM:ss +0000 yyyy");

    tweet_collection.find({ created_at : { $gte:yesterday , $lte : today } }).toArray(function(err, results){
      callback(null, results);
    });
  });
};

DBHandler.prototype.getTweetsByDate = function(userId, date, callback){
  //console.log("Input Date === ",date);
  date = new Date(date);
  //console.log("Dddd = ",date);

  var dateformat = require("dateformat");
  //console.log("Input Date === ",date);

  var today = dateformat(new Date(date),"ddd mmm d 00:00:00 +0000 yyyy");
  //var yesterday = dateformat(new Date(date.getTime() - (24 * 60 * 60 * 1000)),"ddd mmm d 00:00:00 +0000 yyyy");
  //console.log("Today === >>",today);
  //console.log("Yesterday === >>",yesterday);

  this.db.collection('tweets',function(error,tweet_collection){
    if(error){
      //console.log(error);
      if(error.message.indexOf('unique')) {
        // ignore
        //console.log('Duplicate');
      } else {
        return callback(error);
      }
    }
  tweet_collection.find({ created_at : { $gte : today }}).toArray(function(err, test){
    callback(null, test);
  });
});

};
exports.DBHandler = DBHandler;