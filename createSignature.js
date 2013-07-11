var randomGeneration = require('./randomGeneration.js');
var url = require('url');
var crypto = require('crypto');


module.exports = {
 create : function(method,urlString,params,oauth_headers,consumerSecret,access_token_secret){
 var reqString = method + '&'+ randomGeneration.encodeData(urlString) + '&' + randomGeneration.encodeData(params) + randomGeneration.encodeData(oauth_headers.join('&'));
 //console.log("Signature base string: ",reqString);

 var key = "";
 if(access_token_secret!=null){
  key = randomGeneration.encodeData(consumerSecret) + '&' + randomGeneration.encodeData(access_token_secret);
  //urlString = urlString + '?' + params.join('&');
 } 
 
 var signature = randomGeneration.encodeData(crypto.createHmac('sha1', key).update(reqString).digest('base64'));

// console.log("\nSignature String:",signature);

 oauth_headers.push('oauth_signature=' + signature);
 var options = url.parse(urlString);

 options.headers = {
  Authorization: 'OAuth ' + oauth_headers.join(','),
 };
 options.method = method;

 return options;
 }
};


 