const functions = require('firebase-functions');
const express = require('express');

const  FBAuth  = require('./utils/fbAuth');
const { getAllScreams, postOneScream } = require('./handlers/screams');
const { login, signup } = require('./handlers/users');
//const DB = require('./utils/admin');

// using app
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/* Here using nodejs to store functions on firebase. THen we use end points url (like restful api) created in firebase to run them
We can find them in the firebase dashboad. We needed to run firebase deploy to put them in firebase*/
/* Now using express instead */




/*------------------------------------------------------------------------------------------------------------------------------
																										SIGNUP ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/
app.post('/signup', signup);

/*------------------------------------------------------------------------------------------------------------------------------
																										LOGIN ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/

app.post('/login', login);

/*------------------------------------------------------------------------------------------------------------------------------
																									GET SCREAMS ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/
app.get('/screams', getAllScreams);

// Second argument - FBAuth, is a function we can create to act as middleware
app.post('/scream', FBAuth, postOneScream);

/*------------------------------------------------------------------------------------------------------------------------------
																									ADD A SCREAEM ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/

exports.api = functions.region('europe-west1').https.onRequest(app); // registering app with routes