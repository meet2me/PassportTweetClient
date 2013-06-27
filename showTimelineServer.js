var http = require('http'),
	fs = require('fs');


var express = require('express');

var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res) {
  res.render('showTimelineJade', {
    title: 'Timeline'
  });
});



//Alternate way : if not  using "app.use(express.static(__dirname + '/public'))" in configuration
/*
app.get('/timeline.json', function(req, res, next) {
  fs.readFile(__dirname + '/public/timeline.json',function (err, data){
    if(err) return next(err);

    res.writeHead(200, {'Content-Type': 'application/json','Content-Length':data.length});
    res.write(data)
    res.end(200);
  });
});
*/


http.createServer(app).listen(3000, function(){
  console.log('Express server listening');
});

/*
http.createServer(function(req, res){
	console.log("Request:", req);
	fs.readFile('seeTimeline.html',function (err, data){

		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end();
	});
}).listen(3000);
*/