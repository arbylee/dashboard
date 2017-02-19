var express = require('express')
var jsonfile = require('jsonfile');
var google = require('googleapis');
var prompt = require('prompt');

var secretsManager = require('./secrets-manager');

var app = express()
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;

var scopes = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

var password;
prompt.get({properties: {password: {hidden: true}}}, function(err, result) {
  var googleapi_secrets = secretsManager.read(result.password.trim(), 'google')
  var oauth2Client = new OAuth2(
    googleapi_secrets.client_id,
    googleapi_secrets.client_secret,
    googleapi_secrets.callback_url
  );

  password = result.password;

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  app.get('/auth', function(req, res) {
    try {
      var tokens = jsonfile.readFileSync('tokens.json');
    } catch(e) {
      console.log(e);
      res.redirect(url);
    }

    if (new Date(tokens.expiry_date) < new Date()) {
      res.redirect(url);
    }

    oauth2Client.setCredentials(tokens);
    google.options({
        auth: oauth2Client
    });

    res.send('logged in');
  })

  app.get('/callback', function(req, res) {
    var code = req.query.code;
    oauth2Client.getToken(code, function (err, tokens) {
      jsonfile.writeFile('tokens.json', tokens, function(error){
        console.log(error);
      })
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
