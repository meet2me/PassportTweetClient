var http = require('http');

var express = require('express');
var app = express();

var routes = require('./routes');
require('./config/configureApp')(app);

var passport = require('passport');
require('./passport')(passport);


app.get('/', routes.index);
// app.get('/', passport.authenticate('twitter'));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));

app.get('/login', function(req,res){
  res.render('getLogin.jade');
});

app.get('/logout', function(req, res) {
    req.session.user = undefined;
    req.logout();
    res.redirect('/login');
});

app.get('/todayTweet', routes.todayTweet);
app.post('/getTweets', routes.getTweets);
app.get('/graph', routes.graph);

http.createServer(app).listen(app.get('port'), function(){
  //console.log('Express server listening on port ' + app.get('port'));
});
