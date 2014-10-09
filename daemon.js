var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var UUID = require('uuid');
var _ = require('lodash');
var config = require('./config');
var Promise = require('es6-promises');

var CONTEXT_URI = "http://plp.hackers4peace.net/context.jsonld";

var daemon = express();
daemon.use(bodyParser.json({ type: 'application/ld+json' }));

daemon.use(cors({ origin: true }));
daemon.options('*', cors());

// listProfile: Receives the URI (probably from a plp-editor) and adds it to the list
daemon.post('/', function(req, res){

  // Get the URI where the profile is stored from requesr
  var profile = req.body;
  var uuid = UUID.v4();
  var uri = config.domain + '/' + uuid;
  var path = 'data/'+ uuid;

  superagent.get(profile['@id'])
    .accept('application/ld+json')
    .buffer()
    .end(function(provRes){
      if(provRes.ok){

        var fullProfile = JSON.parse(provRes.text);

        // delete context FIXME
        delete fullProfile["@context"];

        var listing = {
          "@id": uri,
          "@type": "Listing",
          about: fullProfile
        };

        // Save to filesystem
        fs.writeFile(path, JSON.stringify(listing), function (err) {

          if (err) {
            console.log(err);
            res.send(500);
            throw err;
          }

          console.log('Saved profile to:', path);

          // Reference to this listing should be appended to the profile before returning it
          var tiny = {
            "@context": "http://plp.hackers4peace.net/context.jsonld",
            "@id": uri,
            "@type": "Listing"
          };

          res.json(tiny);

        });
      } else {
        console.log('failed fetching', profile["@id"]);
      }
    });
});

// returns a promise which resolves with JSON object from file
function readFile(name){
  return new Promise(function(resolve, reject){
    fs.readFile(config.dataPath + name, function(err, buffer){
      if(err) reject(err);
      resolve(JSON.parse(buffer.toString()));
    });
  });
}

// getProfiles: Returns the profiles listed on this plp-directory
daemon.get('/', function(req, res){

  fs.readdir(config.dataPath, function(err, files){
    if(err) return console.log( "readdir failed.", err);

    //remove .gitkeep
    _.remove(files, function(name){ return name === ".gitkeep"; });
  console.log(files.map(readFile));

    Promise.all(files.map(readFile)).then(function(listings) {
      var result = {
        "@context": CONTEXT_URI,
        "@graph": listings
      };
      res.json(result);

      console.log("Done reading files. returning " + result);

    }).catch(function(err){
      console.log( "readdir failed.", err);
    });
  });
});


daemon.listen(config.listenOn, function(err){
  console.log('listening on:', config.listenOn);
});
