var express = require('express');
var google = require('googleapis');
var prompt = require('prompt');

var SecretsManager = require('./secrets-manager');
var GmailComponent = require('./components/gmail');

var app = express()
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;

const root = __dirname + '/../build';

prompt.get({properties: {password: {hidden: true}}}, function(err, result) {
  var password = result.password.trim();
  var apiSecretsManager = SecretsManager(password, 'all_the_secrets');
  var tokenSecretsManager = SecretsManager(password, 'all_the_tokens');

  app.use('/', express.static(root));

  GmailComponent.setup(app, apiSecretsManager, tokenSecretsManager);

  app.listen(3010);
})
