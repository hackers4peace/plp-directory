var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var UUID = require('uuid');
var _ = require('lodash');
var config = require('./config');
var Promise = require("promised-io");

var CONTEXT_URI = "http://plp.hackers4peace.net/context.jsonld";

var daemon = express();
daemon.use(bodyParser.json());

daemon.use(cors({ origin: true }));
daemon.options('*', cors());

// listProfile: Receives the URI (probably from a plp-editor) and adds it to the list
daemon.post('/', function(req, res){

  // Get the URI where the profile is stored from requesr
  var profile = req.body;
  var uuid = UUID.v4();
  var uri = config.domain + '/' + uuid;
  var path = 'data/'+ uuid;

  // TODO fetch profile from provider
  // FIXME use application/ld+json
  superagent.get(profile["@id"])
    .end(function(provRes){
      if(provRes.ok){

        var fullProfile = JSON.parse(provRes.body);

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

// getProfiles: Returns the profiles listed on this plp-directory
daemon.get('/', function(req, res){

  // Wrap the io functions with ones that return promises.
  var readdir_promise = Promise.convertNodeAsyncFunction(fs.readdir);
  var readFile_promise = Promise.convertNodeAsyncFunction(fs.readFile);

  p = readdir_promise( config.datapath );
  p.then( function( files ) {

      // Create an array of promises
      var promises = [];
      var listings = [];

      for ( var i = 0; i < files.length; i++ ) {

          promises.push( readFile_promise(config.datapath+files[i] ) );
          console.log(files[i]);

      }

      group = Promise.all(promises);
      group.then( function(results) {

          for ( i = 0; i < results.length; i++ ) {
              console.log(results[i]);
              listings.push(JSON.parse(results[i]));
          }

          var result = {
            "@context": CONTEXT_URI,
            "@graph": listings
          };

          // Once all files have been looped, return the JSON object
          res.json(result);

          console.log("Done reading files. returning " + result);

      }, function( error ) {

          console.log("Error reading files " + error);

      });

  }, function( error ) {

      console.log( "readdir failed.");

  });

});


daemon.listen(config.listenOn, function(err){
  console.log('listening on:', config.listenOn);
});
