const functions = require('firebase-functions');
const express = require('express');

const  FBAuth  = require('./utils/fbAuth');
const { getAllScreams, postOneScream, getScream, commentOnScream } = require('./handlers/screams');
const { login, signup, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');
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
																										USER ROUTES
-------------------------------------------------------------------------------------------------------------------------------*/
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/users', FBAuth, getAuthenticatedUser);


/*------------------------------------------------------------------------------------------------------------------------------
																										SCREAM ROUTES
-------------------------------------------------------------------------------------------------------------------------------*/
app.get('/screams', getAllScreams);

// Second argument - FBAuth, is a function we can create to act as middleware
app.post('/scream', FBAuth, postOneScream);

// get a cream including any comments attached
app.get('/screams/:screamId', getScream);

// comment on a particular scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);


/*------------------------------------------------------------------------------------------------------------------------------
																									ADD A SCREAEM ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/

exports.api = functions.region('europe-west1').https.onRequest(app); // registering app with routes