var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var uuid = require('uuid');
var _ = require('lodash');

var daemon = express();
daemon.use(bodyParser.json())

daemon.use(cors({ origin: true }));
daemon.options('*', cors());

// listProfile: Receives the URI (probably from a plp-editor) and adds it to the list
daemon.post('/listProfile', function(req, res){

  // Get the URI where the profile is stored from requesr

  var profileUri = req.body.uri;

  // Assign uuid and store in FS
  var path = 'data/listings/'+ uuid.v4();

  fs.writeFile(path,profileUri, function (err) {

    if (err) {
      console.log(err);
      res.send(500, 'Something is wrong with the URI');
      throw err;
    }

    console.log('Saved profile to '+path);

    // Reference to this listing should be appended to the profile before returning it

    res.send(200, profileUri);

  });

});

// getProfiles: Returns the profiles listed on this plp-directory
daemon.get('/getProfiles', function(req, res){

  // FIXME: Read files asynchronously and add error checking (file does not exist)

  // Create object to store profile URIs
  var profiles = new Object();

  // Loop through the listings folder and append URIs to be returned
  var files = fs.readdirSync('data/listings/');

  files.forEach( function (file) {

    var data = fs.readFileSync('data/listings/'+file,{encoding:"utf8"});

    // Append the URI of the profile on the profiles Object.
    profiles[file] = data;

  });

  // Once all files have been looped, return the JSON object
  res.send(200,JSON.stringify(profiles));

});

// getProfile: Returns the profile specified by uuid parameter
daemon.get('/getProfile/:uuid', function(req, res){

  // FIXME: Read files asynchronously and add error checking (files does not exist)

  // Get the uuid from the parameter
  var uuid = req.params.uuid;

  // Extract the content of the profile which is stored under data/profiles
  var profile = fs.readFileSync('data/profiles/'+uuid,{encoding:"utf8"});

  // Return it
  res.send(200, profile);

});

daemon.listen(3000);
