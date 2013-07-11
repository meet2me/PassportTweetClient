var https = require ('https');
var url = require('url');
var request = require('request');
var crypto = require('crypto');
var http = require('http');
var fs = require('fs');
//var mongoose = require('mongoose');

var DBHandler = require('./dbHandle.js').DBHandler;
var dbHandler= new DBHandler('localhost', 27017);

var createSignature = require('./createSignature.js')
var randomGeneration = require('./randomGeneration.js');

var obj = JSON.parse(fs.readFileSync('consumerCredentials.json', 'utf8'));
var consumerKey = obj.consumer_key;
var consumerSecret = obj.consumer_secret_key;
var callbackURL = obj.callback;


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
    var method = 'GET';
    var urlString = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
    var params = '';

    var oauth_headers = this.buildHeaders({
      token: token
    });

    var options = createSignature.create(method,urlString,params,oauth_headers,consumerSecret,tokenSecret);
    var value = '';
    var tweets = '';
    var text = '';
    var reqGet = https.request(options, function(resToken) {
      console.log("statusCode: ", resToken.statusCode);
      var data = '';
      resToken.on('data', function(chunk) {
        data += chunk;
      });
      resToken.on('end', function() {
        tweets = JSON.parse(data);
        //req.session.tweets = tweets;
        //Save tweets to DB
        dbHandler.saveTweets(tweets,function(error){
          if(error) {
            console.log("DB Error:",error);
          }
        });
        //res.render()
      });
    }).on('error', function(error) {
        console.log("Error: ", error);
      });
    reqGet.end();
  }
};