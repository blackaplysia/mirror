Google Glass Mirror API Sample.

INSTALL
=======

    cd mirror
    npm install passport
    npm install passport-google-oauth
    npm install connect-ensure-login
    npm install config

CONFIGURE
=========

Edit config/default.json.

    {
        "google":{
            "clientID":"YOUR_GOOGLE_OAUTH_CLIEND_ID",
            "clientSecret":"YOUR_GOOGLE_OAUTH_CLIENT_SECRET",
            "callbackURL":"YOUR_GOOGLE_OAYTH_CALLBACK_URL"
        }
    }

RUN
===

    node app.js
