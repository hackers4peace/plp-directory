var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var uuid = require('uuid');
var _ = require('lodash');

var daemon = express();
daemon.use(bodyParser.json());

daemon.get('/new', function(req, res){
  res.send(200, "FORM");
});

function getProfileUrl(profile,domain){
	return _.find(profile.contactPoint,function(point){
		return point.id.match(domain);
	}).id;
}

daemon.post('/new', function(req, res){
  console.log(req.body);
  superagent.get(req.body.url)
    .accept('json')
    .end(function(data){
      //console.log(data.body);
      
      var profile = data.body;
      
      result = {"id" : uuid.v4(),
      			"country" : profile.homeLocation.name,
      			"city" : profile.currentLocation.name,
      			"name" : profile.name,
      			"shortbio" : profile.description,
      			"website" : profile.id,
      			"twitter" : getProfileUrl(profile,"twitter.com"),
      			"github" : getProfileUrl(profile,"github.com"),
      			"facebook" : getProfileUrl(profile,"facebook.com")      			
      			};
      			
      console.log(result);
      
    });
  res.send(200, "Yo Dawg!");
});

daemon.listen(3000);
