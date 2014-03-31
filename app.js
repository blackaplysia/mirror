/*
 * Google Mirror API Sample.
 */

var express = require('express'),
  https = require('https'),
  http = require('http'),
  path = require('path'),
  conf = require('config'),
  passport = require('passport'),
  ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

function insertCard() {
  if (!token) return null;

  var params = {};
  params.text =  'Hello, I am a Mirror API.';
  params.notification = {};
  params.notification.level = 'DEFAULT';
  var data = JSON.stringify(params);

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
    res.render("main", { title: '/', userName: req.user.displayName });
  }
});
app.get('/message', ensureLoggedIn('/login'), function(req, res) {
  insertCard();
  res.render("message");
});
app.get('/login', function(req, res) {
  res.redirect('/auth/google');
});
app.get('/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/glass.timeline' ],
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'}));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'}));
app.get('/logout', function(req, res) {
  req.logout();
  res.render("logout");
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
