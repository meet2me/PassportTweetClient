var https = require ('https');
var url = require('url');
var request = require('request');
var crypto = require('crypto');
var http = require('http');
var fs = require('fs');

//Endoing in ASCII form
var encodeData= function(toEncode){
 if( toEncode == null || toEncode == "" ) return ""
 else {
    var result= encodeURIComponent(toEncode);
    // Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
    return result.replace(/\!/g, "%21")
                 .replace(/\'/g, "%27")
                 .replace(/\(/g, "%28")
                 .replace(/\)/g, "%29")
                 .replace(/\*/g, "%2A");
 }
}

//Random nonce generation
function generateNonce() {
    var chars = '0123456789abcdef';
    var result = '';
    for (var i = 32; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

//Unique for application
var consumerKey = 'Ok5yih5NW3Gy4Wp5LRKtGA' || 'DL9uUWGLYVlv89u8Ds2A';
var consumerSecret = 'cr8GGmmu2DaaqcqgPK5akJvEITOXAZH5sDZ2iVzY' || 'ueBvKdkbpra2UM1GATgUa9J7wyEZim06qBYO8yaRQWg';

//Created randomaly
var nonce = generateNonce();

//Created per request
var timestamp = Math.floor(Date.parse(new Date()) / 1000) ;

// Generate OAuth Signature
var method = 'POST';
var params = '';
var urlString = 'https://api.twitter.com/oauth/request_token';
var callbackURL = 'http://aragorn.improwised.com:3000/callback';
var encodedCallback = encodeData(callbackURL);

var oauth_headers = [
    'oauth_callback=' + encodedCallback,
    'oauth_consumer_key=' + consumerKey,
    'oauth_nonce='+nonce,
    'oauth_signature_method=HMAC-SHA1',
    'oauth_timestamp='+timestamp,
    'oauth_version=1.0'
];


var reqString = method + '&'+ encodeData(urlString) + '&' + encodeData(params) + encodeData(oauth_headers.join('&'));
console.log("Signature base string: ",reqString);

var key = encodeData(consumerSecret)+'&';
console.log("Key:",key);

var signature = encodeData(crypto.createHmac('sha1', key).update(reqString).digest('base64'));

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
var reqGet = https.request(options, function(res) {
  console.log("statusCode: ", res.statusCode);
  //console.log("Header Response: ",res.headers);

  var data = '';
  res.on('data', function(chunk) {
    data += chunk;
  });
  

  res.on('end', function() {
    oauth_token=data.split('&')[0];
    oauth_token_secret=data.split('&')[1];
    console.log("OAuth_Token : ",oauth_token);
    console.log("OAuth_token_secret : ",oauth_token_secret);
    console.log("Data : ",data);
    //console.log("Token & secret :",data.split('&')[2]);

    //res.writeHead(301, {Location: 'https://api.twitter.com/oauth/authorize?oauth_token='+oauth_token});
    fs.writeFile('requestToken.txt',oauth_token+'\n'+oauth_token_secret,function(err){
      if(err){
        console.log("Error :", err);
      }
    });


  })
  
}).on('error', function(error) {
    console.log("Error: ", error);
});

reqGet.end();
module.export = function (){
  return reqGet;
};