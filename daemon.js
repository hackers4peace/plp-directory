var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var uuid = require('uuid');
var _ = require('lodash');

var daemon = express();
daemon.use(bodyParser.json());

// listProfile: Receives the URI (probably from a plp-editor) and adds it to the list
daemon.post('/listProfile', function(req, res){

  // Get the URI where the profile is stored
  var profileUri = req.data;

  // Assign uuid and store in FS
  var path = 'data/listings'+uuid.v4();

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

  // Loop through the profile folder and return URIs

});

daemon.listen(3000);
