#!/usr/bin/env node

var prompt = require('prompt');
var secretsManager = require('../server/secrets-manager')

prompt.start();

prompt.get({properties: {password: {hidden: true}}}, function(err, result) {
  password = result.password.trim();
  secretsManager.store(password)
})
