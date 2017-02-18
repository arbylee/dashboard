var express = require('express')
var app = express()
var jsonfile = require('jsonfile');


var google = require('googleapis');
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  '<CLIENT_ID>',
  '<CLIENT_SECRET>',
  'http://richard-dash.com:3010/callback'
);

var scopes = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

var url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

app.get('/auth', function(req, res) {
  try {
    var tokens = jsonfile.readFileSync('credentials.json');
  } catch(e) {
    console.log(e);
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
  console.log(code);
  oauth2Client.getToken(code, function (err, tokens) {
    console.log(err);
    console.log(tokens);
    jsonfile.writeFile('credentials.json', tokens, function(error){
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
    console.log(response);
    res.send(response);
  })
})

app.get('/labels', function(req, res) {
  var params = {
    userId: 'me'
  }
  gmail.users.labels.list(params, function(err, response) {
    console.log(response);
    res.send(response);
  })
})

app.listen(3010);
