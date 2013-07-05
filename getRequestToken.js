/*
Code to get request token 
*/
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

var nonce = randomGeneration.generateNonce();
//Created per request
var timestamp = Math.floor(Date.parse(new Date()) / 1000) ;


// Generate OAuth Signature
var method = 'POST';
var params = '';
var urlString = 'https://api.twitter.com/oauth/request_token';
var callbackURL = 'http://aragorn.improwised.com:3000/callback';
var encodedCallback = randomGeneration.encodeData(callbackURL);

var oauth_headers = [
    'oauth_callback=' + encodedCallback,
    'oauth_consumer_key=' + consumerKey,
    'oauth_nonce='+nonce,
    'oauth_signature_method=HMAC-SHA1',
    'oauth_timestamp='+timestamp,
    'oauth_version=1.0'
];


var reqString = method + '&'+ randomGeneration.encodeData(urlString) + '&' + randomGeneration.encodeData(params) + randomGeneration.encodeData(oauth_headers.join('&'));
console.log("Signature base string: ",reqString);

var key = randomGeneration.encodeData(consumerSecret)+'&';
console.log("Key:",key);

var signature = randomGeneration.encodeData(crypto.createHmac('sha1', key).update(reqString).digest('base64'));

console.log("Signature String:",signature);

oauth_headers.push('oauth_signature=' + signature);
var options = url.parse(urlString);

options.headers = {
  Authorization: 'OAuth ' + oauth_headers.join(','),
};
options.method = method;

//console.log("Request Headers:",options.headers);

var oauth_token= "";
//Post data 
//Will return oauth_token & oauth_token_secret
module.exports = function(options,req,res){
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
} 
