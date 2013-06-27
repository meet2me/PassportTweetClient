var https = require ('https');
var url = require('url');
var request = require('request');
var crypto = require('crypto');



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

function generateNonce() {
    var chars = '0123456789abcdef';
    var result = '';
    for (var i = 32; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

//Unique for application
var consumerKey = 'DL9uUWGLYVlv89u8Ds2A';
var consumerSecret = 'ueBvKdkbpra2UM1GATgUa9J7wyEZim06qBYO8yaRQWg';

//Created randomaly
var nonce = '186e93e75cce32b0740521500f60f41c' ||  generateNonce();

//Created per request
var timestamp = 1372241524 || Math.floor(Date.parse(new Date()) / 1000) ;

// Generate OAuth Signature
var method = 'POST';
var params = '';
var urlString = 'https://api.twitter.com/oauth/request_token';
var callbackURL = 'http://aragorn.improwised.com:3000/callback';
var encodedCallback = encodeData(callbackURL);
var oob = 'oob';
//console.log(encodeCallback);
var oauth_headers = ['oauth_nonce='+nonce,
'oauth_consumer_key=' + consumerKey,
'oauth_callback=' + encodedCallback,
'oauth_signature_method=HMAC-SHA1',
'oauth_timestamp='+timestamp,
'oauth_version=1.0'];


var reqString = method + '&'+ encodeData(urlString) + '&' + encodeData(params) + encodeData(oauth_headers.join('&'));

var key = encodeData(consumerSecret)+'&';

var signature = encodeData(crypto.createHmac('sha1', key).update(reqString).digest('base64'));

console.log("Signature String:",signature);

oauth_headers.push('oauth_signature=' + signature);
var options = url.parse(urlString);

options.headers = {
  Authorization: 'OAuth ' + oauth_headers.join(',')
};
console.log("Request Headers:",options.headers);


//Post data 
var reqGet = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    //console.log("Header Response: ",res.headers);
}).on('error', function(error) {
	console.log("Error: ", error);
});

reqGet.end();

