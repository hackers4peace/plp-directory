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
  getAll: function(){
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

function fetchProfile(uri){
  return new Promise(function(resolve, reject){
    superagent.get(uri)
      .accept('application/ld+json')
      .buffer()
      .end(function(provRes){
        if(provRes.ok){
          // FIXME handle parsing errors
          resolve(JSON.parse(provRes.text));
        } else {
          reject();
        }
      });
  });
}

function checkIfNew(uri){
      console.log(uri);
  return new Promise(function(resolve, reject){
    storage.getAll().then(function(all){
      var existing = _.find(all['@graph'], function(listing){ return listing.about['@id'] == uri; });
      console.log(existing);
      if(existing) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

// listProfile: Receives the URI (probably from a plp-editor) and adds it to the list
daemon.post('/', function(req, res){

  // Get the URI where the profile is stored from requesr
  var profileUri = req.body['@id'];

  checkIfNew(profileUri).then(function(){
    var uuid = UUID.v4();
    var uri = 'http://' + config.domain + '/' + uuid;
    var path = 'data/'+ uuid;

    fetchProfile(profileUri)
      .then(function(profile){
        // delete context FIXME
        delete profile["@context"];

        var listing = {
          "@id": uri,
          "@type": "Listing",
          about: profile
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

      }).catch(function(){
        console.log('failed fetching', profileUri);
        // TODO add error reporting
        res.send(500);
      });
  }, function(){
    res.send(409);
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

daemon.delete('/:uuid', function(req, res){
  // TODO add authentication
  storage.delete(req.params.uuid)
    .then(function(){
      res.send(200);
    })
    .catch(function(err){
      // TODO add error reporting
      res.send(500);
    });
});


daemon.listen(config.listenOn, function(err){
  console.log('listening on:', config.listenOn);
});
