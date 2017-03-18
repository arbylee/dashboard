var fs = require('fs');
var crypto = require('crypto');

var SecretsManager = function(passw, secrets_filename) {
  var algorithm = 'aes-256-ctr';
  var password = passw;
  var secrets;

  var getSecrets = function() {
    if (fs.existsSync(secrets_filename)) {
      encrypted_secrets = fs.readFileSync(secrets_filename, 'utf8');
      secrets = JSON.parse(decrypt(encrypted_secrets));
    } else {
      secrets = {};
    }

    return secrets;
  }

  var save = function(name, data) {
    var secrets = getSecrets();
    secrets[name] = data;
    var encrypted_secrets = encrypt(JSON.stringify(secrets));
    fs.writeFile(secrets_filename, encrypted_secrets, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
    });
  }

  var read = function(name) {
    var secrets = getSecrets();
    return secrets[name];
  }

  // Nodejs encryption with CTR
  function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  }

  function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  }

  return {
    read,
    save
  }
}

module.exports = SecretsManager;
