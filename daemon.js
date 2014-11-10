var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var UUID = require('uuid');
var _ = require('lodash');
var config = require('./config');
var Promise = require('es6-promises');

var CONTEXT_URI = "http://plp.hackers4peace.net/context";

var daemon = express();
daemon.use(bodyParser.json({ type: 'application/ld+json' }));

daemon.use(cors({ origin: true }));
daemon.options('*', cors());

// returns a promise which resolves with JSON object from file
function readFile(name){
  return new Promise(function(resolve, reject){
    fs.readFile(config.dataPath + name, function(err, buffer){
      if(err) reject(err);
      resolve(JSON.parse(buffer.toString()));
    });
  });
}

var storage = {
  getAll: function(uuid){
    return new Promise(function(resolve, reject){
      fs.readdir(config.dataPath, function(err, files){
        if(err) reject(err);
        //remove .gitkeep
        _.remove(files, function(name){ return name === ".gitkeep"; });
        Promise.all(files.map(readFile)).then(function(listings) {
          var result = {
            "@context": CONTEXT_URI,
            "@graph": listings
          };
          resolve(result);
        }).catch(reject);
      });
    });
  },
  save: function(uuid, content){
    return new Promise(function(resolve, reject){
      var path = config.dataPath + '/' + uuid;
      fs.writeFile(path, JSON.stringify(content), function(err, data){
        if(err) reject(err);
        resolve(content);
      });
    });
  },
  delete: function(uuid){
    return new Promise(function(resolve, reject){
      var path = config.dataPath + '/' + uuid;
      fs.unlink(path, function(err){
        if(err) reject(err);
        resolve();
      });
    });
  },
};

// listProfile: Receives the URI (probably from a plp-editor) and adds it to the list
daemon.post('/', function(req, res){

  // Get the URI where the profile is stored from requesr
  var profile = req.body;
  var uuid = UUID.v4();
  var uri = 'http://' + config.domain + '/' + uuid;
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

        storage.save(uuid, listing)
          .then(function(data){
            var min = {
              "@context": "http://plp.hackers4peace.net/context.jsonld",
              "@id": data["@id"],
              "@type": "Listing"
            };
            res.type('application/ld+json');
            res.send(min);
          })
          .catch(function(err){
            // TODO add error reporting
            res.send(500);
          });
          // Reference to this listing should be appended to the profile before returning it
      } else {
        console.log('failed fetching', profile["@id"]);
      }
    });
});

// getProfiles: Returns the profiles listed on this plp-directory
daemon.get('/', function(req, res){
  storage.getAll()
    .then(function(data){
      res.type('application/ld+json');
      res.send(data);
    })
    .catch(function(err){
      // TODO add error reporting
      res.send(500);
    });
});


daemon.listen(config.listenOn, function(err){
  console.log('listening on:', config.listenOn);
});
