var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent');

var daemon = express();
daemon.use(bodyParser.json());

daemon.get('/new', function(req, res){
  res.send(200, "FORM");
});

daemon.post('/new', function(req, res){
  console.log(req.body);
  superagent.get(req.body.url)
    .accept('json')
    .end(function(data){
      console.log(data.body);
    });
  res.send(200, "Yo Dawg!");
});

daemon.listen(3000);
