
/**
 * Module dependencies.
 */

var express = require('express');
var https = require('https');
var http = require('http');
var path = require('path');
var conf = require('config');

var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var token = null;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: conf.google.clientID,
    clientSecret: conf.google.clientSecret,
    callbackURL: conf.google.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('accessToken: ' + accessToken);
    token = accessToken;
    process.nextTick(function() {
      return done(null, profile);
    });
  }
));

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3700);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(express.json());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

function insertCard() {
  if (!token) return null;

  var data = '{ "text": "Hello, I am a Mirror API.", "notification": {"level": "DEFAULT"}}';
  var options = {
    host: 'www.googleapis.com',
    path: '/mirror/v1/timeline',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': 'Bearer ' + token
    }
  }
  console.log('Token: ' + token);
  var post_req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      console.log('Response: ' + chunk);
    });
  });
  post_req.write(data);
  post_req.end();
}

app.get('/', ensureLoggedIn('/login'), function(req, res) {
  if (!req.user) {
    res.render("login", { title: '/' });
  } else {
    res.render("message", { title: '/', userName: req.user.displayName });
  }
});
app.get('/message', ensureLoggedIn('/login'), function(req, res) {
  insertCard();
  res.send("Sent a message");
});
app.get('/login', function(req, res) {
  res.redirect('/auth');
});
app.get('/auth',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/glass.timeline' ],
    failureRedirect: '/login'}),
  function(req, res) {
  });
app.get('/auth/callback',
  passport.authenticate('google', { failureRedirect: '/login'}),
  function(req, res) {
    res.redirect('/');
  });
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
