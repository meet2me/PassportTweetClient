var https = require ('https');
var url = require('url');
var request = require('request');
var fs = require('fs');
var crypto = require('crypto');

var timestamp = Math.floor(Date.parse(new Date()) / 1000);

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

// Save into a config
// Note: Access token will be different for every user (preferably, will be provided from front-end)

// Application
var consumerKey = 'DL9uUWGLYVlv89u8Ds2A';
var consumerSecret = 'ueBvKdkbpra2UM1GATgUa9J7wyEZim06qBYO8yaRQWg';

// User
var accessToken = '480485341-6pPxBKkzW7o2MswvdfXmG78dg3K6egfCEy8IyUmM';
var accessTokenSecret = 'jZWaNaZo1JEl5uFEI9BfRjjeTXr4fVKYnh5EPii9Bs';

// Random
var nonce = generateNonce();

// Generate OAuth Signature
var method = 'GET';
var urlString = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
var params = '';
//console.log(encodeData(params));


var oauth_headers = ['oauth_consumer_key=' + consumerKey,
'oauth_nonce=' + nonce,
'oauth_signature_method=HMAC-SHA1',
'oauth_timestamp=' + timestamp,
'oauth_token=' + accessToken,
'oauth_version=1.0'];

var reqString = method + '&' + encodeData(urlString) + '&' + encodeData(params) + encodeData(oauth_headers.join('&'));

var key = encodeData(consumerSecret) + '&' + encodeData(accessTokenSecret);
var signature = encodeData(crypto.createHmac('sha1', key).update(reqString).digest('base64'));

oauth_headers.push('oauth_signature=' + signature);
var options = url.parse(urlString);
options.headers = {
  Authorization: 'OAuth ' + oauth_headers.join(',')
};

var value = '';
var reqGet = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);


    res.on('data', function(d) {
      //console.info('GET result:\n');
      //console.log(d);
      ///process.stdout.write(d);
      value += d;
      //var value = value.replace("", "");
    });

    res.on('end', function() {
      writeToFile(JSON.parse(value), function(error) {
        if(error) { throw error; }
        console.log('Data written Successfully');
      });
    })

}).on('error', function(error) {
	console.log("Error: ", error);
});

reqGet.end();
//console.log("reqGet :",reqGet);

function writeToFile(object, callBack) {
//string = string + object.toString() ;

var jsonTxt = fs.writeFile('timeline.json',JSON.stringify(object, null, 2),function(err){
  if(err){
    console.log(err);
    return callBack(err);
  }
  callBack();
});
}