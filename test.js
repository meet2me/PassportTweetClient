var http = require('http');
var https = require('https');
var async = require('async');
var express = require('express');
var app = express();

app.set('port', 8080);
app.use(function (req, res, next){
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));


app.get('/ping', function(req,res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
  	res.end('OK');
});

app.get('/reverse/string', function(req,res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	var str = req.param('str');
	var str2 = '';
	str2 = str.split("").reverse().join("");
	res.end(str2);
});

app.get('/reverse/words', function(req,res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	var str = req.param('str');
	str2 = str.split("").reverse().join("").split(" ").reverse().join(" ");
	res.end(str2);
});


http.createServer(app).listen(app.get('port'), function(request,response){
  	console.log('Express server listening on port ' + app.get('port'));
	console.log("Server started.");
});
