var express = require('express');

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/boa-balance', function(req, res) {
  return res.send({"balance":"9999.99","date":"March 10, 2017"});
});
app.listen(3010);
