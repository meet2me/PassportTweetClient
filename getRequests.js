var https = require ('https');
var url = require('url');
var request = require('request');
var crypto = require('crypto');
var http = require('http');
var fs = require('fs');

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
  getToken : function(req,res){
    var method = 'POST';
    var params = '';
    var urlString = 'https://api.twitter.com/oauth/request_token';
    var encodedCallback = randomGeneration.encodeData(callbackURL);

    var oauth_headers = this.buildHeaders({
      callback: encodedCallback
    });
    
    var options = createSignature.create(method,urlString,params,oauth_headers,consumerSecret,null,null);
    //console.log("Request Headers:",options.headers);

    var oauth_token= "";
    //Post data 
    //Will return oauth_token & oauth_token_secret

    var reqGet = https.request(options, function(resToken) {
      console.log("statusCode: ", resToken.statusCode);
      var data = '';
      resToken.on('data', function(chunk) {
        data += chunk;
      });
      resToken.on('end', function() {
        oauth_token=data.split('&')[0];
        oauth_token_secret=data.split('&')[1]; 
        req.session.oauth_token = oauth_token.split('=')[1];
        req.session.oauth_token_secret = oauth_token_secret.split('=')[1];
        // TODO: Generate authorization URL
        //URL to authorize an app
        var authUrl = 'https://api.twitter.com/oauth/authorize?oauth_token='+req.session.oauth_token;
        //Will be getting from respone : used in next request to get access token
        var oauth_verifier = "";
        req.method = 'GET';
        res.redirect(authUrl);
      });
    }).on('error', function(error) {
      console.log("Error: ", error);
    });
    reqGet.end();
  },

  getTweet : function(req,res){
    var method = 'GET';
    var urlString = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
    var params = '';

    var oauth_headers = this.buildHeaders({
      token: req.session.access_token
    });

    var options = createSignature.create(method,urlString,params,oauth_headers,consumerSecret,req.session.access_token_secret,null);
    var value = '';
    var tweets = '';
    var reqGet = https.request(options, function(resToken) {
      console.log("statusCode: ", resToken.statusCode);
      //console.log("Req: ",req);
      var data = '';
      resToken.on('data', function(chunk) {
        data += chunk;
        tweets = data.toString();
      });
      resToken.on('end', function() {
        tweets = JSON.parse(tweets);
        req.session.tweets = tweets;
        //console.log("Tweets : ", tweets);
        res.render('showTimelineJade',{data : tweets});
      });
    }).on('error', function(error) {
        console.log("Error: ", error);
    });
      reqGet.end();
  },

  getAccessToken : function(req,res){
    oauth_token = req.param("oauth_token");
    oauth_verifier = req.param("oauth_verifier");
    var urlString = "https://api.twitter.com/oauth/access_token";
    var method = "POST";
    var headers = this.buildHeaders({
      token: oauth_token
    });

    var params = [
      'oauth_verifier='+oauth_verifier
    ];
    var options = createSignature.create(method,urlString,params,headers,consumerSecret,null,oauth_token_secret);
    var reqGet = https.request(options, function(resToken) {
      console.log("statusCode: ", resToken.statusCode);
      var data = '';
      resToken.on('data', function(chunk) {
          data += chunk;
      });
      resToken.on('end', function() {
        oauth_token=data.split('&')[0];
        oauth_token_secret=data.split('&')[1];
        var access_token2 = data.split('=')[1];
        var access_token = access_token2.split('&')[0];
        var access_token_secret2 = data.split('=')[2];
        var access_token_secret = access_token_secret2.split('&')[0];
        // Save Access token in session
        // req.session.access_token = token
        req.session.access_token = access_token;
        req.session.access_token_secret = access_token_secret ;
        // TODO: Redirect to home page
        res.redirect('/');
      });
    }).on('error', function(error) {
        console.log("Error: ", error);
    });
      reqGet.end();  
  }
};  