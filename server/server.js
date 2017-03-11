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

const root = __dirname + '/../build';

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

  app.use('/', express.static(root));

  app.get('/auth', function(req, res) {
    var google_token = tokenSecretsManager.read(password, 'google');

    if (!google_token) {
      res.redirect(url);
      return;
    }

    oauth2Client.setCredentials(google_token);

    if (new Date(google_token.expiry_date) < new Date()) {
      if (google_token.refresh_token) {
        oauth2Client.refreshAccessToken(function(err, tokens) {
          console.log(err);
          tokenSecretsManager.save(password, 'google', tokens);
        });
      } else {
        res.redirect(url);
        return;
      }
    }

    google.options({
        auth: oauth2Client
    });

    res.send('logged in');
  })

  app.get('/callback', function(req, res) {
    var code = req.query.code;
    oauth2Client.getToken(code, function (err, tokens) {
      if (!err) {
        oauth2Client.setCredentials(tokens);
      }
      tokenSecretsManager.save(password, 'google', tokens);
    });
    google.options({
        auth: oauth2Client
    });
    res.send('worked?')
  });

  app.get('/emails', function(req, res) {
    var params = {
      maxResults: 3,
      userId: 'me',
      q: req.query.q,
    }
    gmail.users.messages.list(params, function(err, listResponse) {
      res.send(listResponse);
    })
  })

  app.get('/boa-balance', function(req, res) {
    var params = {
      userId: 'me',
      labelIds: 'Label_70',
    }
    gmail.users.messages.list(params, function(err, listResponse) {
      var messages = listResponse.messages;
      var getParams = {
        id: messages[0].id,
        userId: 'me'
      }

      gmail.users.messages.get(getParams, function(err, getResponse) {
        var balanceRegexp = new RegExp('Balance: \\\$ (.*) Account:')
        var balanceMatch = getResponse.snippet.match(balanceRegexp);

        var dateRegexp = new RegExp('Date: (.*) View');
        var dateMatch = getResponse.snippet.match(dateRegexp);
        var response = {
          balance: balanceMatch[1],
          date: dateMatch[1],
        }
        return res.send(response);
      });
    });
  })

  app.get('/emails/:emailId', function (req, res) {
    var params = {
      id: req.params.emailId,
      userId: 'me'
    }

    gmail.users.messages.get(params, function(err, response) {
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
