var https = require ('https');
var request = require('request');
var fs = require('fs');
//var mongoose = require('mongoose');

var DBHandler = require('./dbHandle.js').DBHandler;
var dbHandler= new DBHandler('localhost', 27017);

var createSignature = require('./createSignature.js');
var randomGeneration = require('./randomGeneration.js');
var obj = JSON.parse(fs.readFileSync('./config/consumerCredentials.json', 'utf8'));
var consumerKey = obj.consumer_key;
var consumerSecret = obj.consumer_secret_key;

var method = 'GET';
var urlTimeline = JSON.parse(fs.readFileSync('./config/getUrl.json', 'utf8'));

var urlString = urlTimeline.user_timeline;



module.exports = {
  
  buildHeaders: function(options) {
    var headers = [];
    var nonce = randomGeneration.generateNonce();
    //Created per request
    var timestamp = Math.floor(Date.parse(new Date()) / 1000) ;

    if(options.callback) {
      headers.push('oauth_callback=' + options.callback);
    }
    headers.push(
      'oauth_consumer_key=' + consumerKey,
      'oauth_nonce='+nonce,
      'oauth_signature_method=HMAC-SHA1',
      'oauth_timestamp='+timestamp
    );
    if(options.token) {
      headers.push('oauth_token=' + options.token);
    }
    headers.push('oauth_version=1.0');
    return headers;
  },

  getTweet : function(token,tokenSecret,callback){
    var self = this;

    var params = ['count=200'];
    var oauth_headers = this.buildHeaders({
      token: token
    });

    var options = createSignature.create(method,urlString,params,oauth_headers,consumerSecret,tokenSecret);
    var tweets = '';
    
    var reqGet = https.request(options, function(resToken) {
      //console.log("statusCode: ", resToken.statusCode);
      var data = '';
      resToken.on('data', function(chunk) {
        data += chunk;
      });
      resToken.on('end', function() {
        tweets = JSON.parse(data);
        var userId = tweets[0].user.id;
        var this_tweet_id = tweets[0].id;
        var since_id = '';
        
        //Check against DB if new Tweet is available : match stored-max_id  with current max_tweet_id
        dbHandler.getLatestTweetId(userId,function(error,id){
          if(error){
            //console.log("Error:" ,error);
          }
          if(id!==null){
            since_id = id.id;    //id of last/recent tweet in DB
            //console.log("since_id:",since_id);
          }
          
          //console.log("Current Tweet Id from Twitter:", this_tweet_id);
          if(since_id > 0 && this_tweet_id > since_id){
            //console.log("If more new tweets are available..");
            // while(since_id != this_tweet_id){
            //   self.getMoreTweets(userId,token,tokenSecret,since_id);
            // }
            self.getMoreTweets(userId,token,tokenSecret,since_id);
          }
          //Save tweets to DB
          else if(!since_id){
            //console.log("If New User..");
            dbHandler.saveTweets(tweets,function(error){
            if(error) {
              //console.log("DB Error:",error);
            }
            });
          }
        });
      });
    }).on('error', function(error) {
        //console.log("Error: ", error);
      });
    reqGet.end();
  },

  getMoreTweets : function(userId,token,tokenSecret,since_id){

    //console.log("In getMoreTweets......!");
    var oauth_headers = this.buildHeaders({
      token: token
    });

    var params = ['count=200',
      'since_id='+since_id,
      'user_id='+userId
    ];

    var options = createSignature.create(method,urlString,params,oauth_headers,consumerSecret,tokenSecret);
    var tweets = '';
    
    var reqGet = https.request(options, function(resToken) {
      //console.log("statusCode: ", resToken.statusCode);
      var data = '';
      resToken.on('data', function(chunk) {
        data += chunk;
      });
      resToken.on('end', function() {
        tweets = JSON.parse(data);
        dbHandler.saveTweets(tweets,function(error){
          if(error) {
            //console.log("DB Error:",error);
          }
        });
      });
    }).on('error',function(error){
      //console.log("Error:",error);
    });
    reqGet.end();
  }
};