Google Glass Mirror API Sample.

INSTALL
=======

    cd mirror
    npm install



CONFIGURE
=========

Rename config/default.json.smp to config/default.json and edit your 'clientID',
'clientSecret', and 'callbackURL'.  Your 'callbackURL' may have a URI like
"http://exampledomain.com:3700/auth/google/callback".

    {
        "google":{
            "clientID":"YOUR_GOOGLE_OAUTH_CLIEND_ID",
            "clientSecret":"YOUR_GOOGLE_OAUTH_CLIENT_SECRET",
            "callbackURL":"YOUR_GOOGLE_OAUTH_CALLBACK_URL"
        }
    }



RUN
===

    node app.js
