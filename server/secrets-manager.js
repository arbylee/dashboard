var fs = require('fs');
var prompt = require('prompt');
var crypto = require('crypto');

var SecretsManager = function(secrets_filename) {
  var algorithm = 'aes-256-ctr';
  var password;
  var secrets;

  var getSecrets = function(password) {
    if (fs.existsSync(secrets_filename)) {
      encrypted_secrets = fs.readFileSync(secrets_filename, 'utf8');
      secrets = JSON.parse(decrypt(password, encrypted_secrets));
    } else {
      secrets = {};
    }

    return secrets;
  }

  var store = function(password) {
    prompt.start();
    prompt.get(['name', 'client_id', 'client_secret', 'callback_url'], function (err, result) {
      var secrets = getSecrets(password);
      secrets[result.name] = result;
      var encrypted_secrets = encrypt(password, JSON.stringify(secrets));
      fs.writeFile(secrets_filename, encrypted_secrets, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
      });
    });
  }

  var read = function(password, name) {
    var secrets = getSecrets(password);
    return secrets[name];
  }

  // Nodejs encryption with CTR
  function encrypt(password, text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  }

  function decrypt(password, text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  }

  return {
    read,
    store
  }
}

module.exports = SecretsManager;
