var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var UUID = require('uuid');
var _ = require('lodash');
var config = require('./config');

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

  // delete context FIXME
  delete profile["@context"];
  var listing = {
    "@id": uri,
    "@type": "Listing",
    "about": profile
  };

  // TODO fetch profile from provider

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

    res.send(200, tiny);

  });

});

// getProfiles: Returns the profiles listed on this plp-directory
daemon.get('/', function(req, res){

  // FIXME: Read files asynchronously and add error checking (file does not exist)

  // Create object to store profile URIs
  var listings = [];

  // Loop through the listings folder and append URIs to be returned
  var files = fs.readdirSync('data/');

  files.forEach( function (file) {

    var data = fs.readFileSync('data/'+file,{encoding:"utf8"});

    // FIXME .gitkeep :S
    if(data){
      // Append the URI of the profile on the profiles Object.
      listings.push(data);
    }

  });

  var result = {
    "@context": CONTEXT_URI,
    "@graph": listings
  };

  // Once all files have been looped, return the JSON object
  res.send(200,JSON.stringify(result));

});


daemon.listen(config.listenOn, function(err){
  console.log('listening on:', config.listenOn);
});
