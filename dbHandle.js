var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;



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
      if( error ) callback(error);
      else {
                

        for(var i =0;i< tweets.length;i++ ) {
          var tweet = tweets.tweest[i].text;
          console.log("DB Tweet: ",tweet);
        tweet_collection.insert(tweet,function() {
          callback(null, tweets);
        });
        }

      }   
	});
};
exports.DBHandler = DBHandler;
