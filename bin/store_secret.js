#!/usr/bin/env node

var prompt = require('prompt');
var SecretsManager = require('../server/secrets-manager');
var apiSecretsManager = SecretsManager('all_the_secrets');

prompt.start();

prompt.get({properties: {password: {hidden: true}}}, function(err, result) {
  password = result.password.trim();
  prompt.get(['name', 'client_id', 'client_secret', 'callback_url'], function (err, result) {
    apiSecretsManager.save(password, result.name, result)
  });
})

