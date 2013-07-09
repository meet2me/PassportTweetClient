var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var tweet='';
var created_at='';

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
	this.getCollection(function(error,tweet_collection) {
    var clubTweet=[];
    var i=tweets.length;
    if( error ) {
      callback(error);
      }
    else {
      for(var i =0;i< tweets.length;i++ ) {
        tweet = tweets[i].text;
        created_at = tweets[i].created_at;
        //clubTweet.push(tweet);
        console.log("DB Tweet: ",tweet);
        tweet_collection.insert({text :tweet, time: created_at},function(){
          callback(null,tweet);
        });
      }
      //console.log("Tweet Out: ",clubTweet);
    }
  });
};
exports.DBHandler = DBHandler;