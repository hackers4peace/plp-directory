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

function getOrganisationListCSV(profile){
  
  var organisationsCSV = "";

  if (profile.member){
    for (var i = profile.member.length - 2; i >= 0; i--) {
      organisationsCSV += profile.member[i].name + ",";
    };
    organisationsCSV += profile.member[profile.member.length - 1].name;  
  }

  return organisationsCSV;

}

function getSkillsListCSV(profile){
  
  var skillsCSV = "";

  if (profile.skills){
    for (var i = profile.skills.length - 2; i >= 0; i--) {
      skillsCSV += profile.skills[i].name + ",";
    };
    skillsCSV += profile.skills[profile.skills.length - 1].name;  
  }

  return skillsCSV;

}

function getProfileUrl(profile,domain){
  var match = _.find(profile.contactPoint,function(point){
    return point.id.match(domain);
  });

  if (match) return match.id;

  return "";
}

daemon.get('/creator', function(req, res){

  console.log(req.body);

  res.set('Content-Type', 'text/html');
  res.send(new Buffer('some html'));

  // res.redirect('creator.html');

}); 

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
                "organisation" : getOrganisationListCSV(profile),
                "email" : profile.email,
                "skills" : getSkillsListCSV(profile),
                "website" : profile.id,
                "twitter" : getProfileUrl(profile,"twitter.com"),
                "github" : getProfileUrl(profile,"github.com"),
                "facebook" : getProfileUrl(profile,"facebook.com"),
                "google" : getProfileUrl(profile,"google.com"),
                "linkedin" : getProfileUrl(profile,"linkedin.com")
            };
            
      console.log(result);
      
    });
  res.send(200, "Yo Dawg!");
});

daemon.listen(3000);
