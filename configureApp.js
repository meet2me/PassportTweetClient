var express = require('express');

var RedisStore= require('connect-redis')(express);
var sStore  = new RedisStore();


var passport = require('passport')
var TwitterStrategy = require('passport-twitter').Strategy;

module.exports = function(app){
    app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: false});
    app.use(express.favicon());
    app.use(express.logger('dev'));
    //app.use(express.static('public'));
    app.use(express.cookieParser());
    app.use(express.session({store: sStore, secret: '1234567890QWERTY', cookie: { maxAge: 86400000 }}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(__dirname + '/public'));
  });
};