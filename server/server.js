var express = require('express')
var google = require('googleapis');
var prompt = require('prompt');

var SecretsManager = require('./secrets-manager');
var apiSecretsManager = SecretsManager('all_the_secrets');
var tokenSecretsManager = SecretsManager('all_the_tokens');

var app = express()
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;

var scopes = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

prompt.get({properties: {password: {hidden: true}}}, function(err, result) {
  var password = result.password;

  var googleapi_secrets = apiSecretsManager.read(result.password.trim(), 'google')
  var oauth2Client = new OAuth2(
    googleapi_secrets.client_id,
    googleapi_secrets.client_secret,
    googleapi_secrets.callback_url
  );

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  app.get('/auth', function(req, res) {
    var google_token = tokenSecretsManager.read(password, 'google');

    if (!google_token) {
      res.redirect(url);
    }

    if (new Date(google_token.expiry_date) < new Date()) {
      res.redirect(url);
    }

    oauth2Client.setCredentials(google_token);
    google.options({
        auth: oauth2Client
    });

    res.send('logged in');
  })

  app.get('/callback', function(req, res) {
    var code = req.query.code;
    oauth2Client.getToken(code, function (err, tokens) {
      tokenSecretsManager.save(password, 'google', tokens);
      if (!err) {
        oauth2Client.setCredentials(tokens);
      }
    });
    google.options({
        auth: oauth2Client
    });
    res.send('worked?')
  });

  app.get('/emails', function(req, res) {
    var params = {
      maxResults: 3,
      userId: 'me'
    }
    gmail.users.messages.list(params, function(err, response) {
      res.send(response);
    })
  })

  app.get('/labels', function(req, res) {
    var params = {
      userId: 'me'
    }
    gmail.users.labels.list(params, function(err, response) {
      res.send(response);
    })
  })

  app.listen(3010);
})
