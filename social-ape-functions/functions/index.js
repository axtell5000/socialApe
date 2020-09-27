const functions = require("firebase-functions");
const express = require("express");

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream
} = require('./handlers/screams');
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./handlers/users');
const fbAuth = require('./util/fbAuth');

const app = express();

// fetching screams route
app.get("/screams", getAllScreams);

// creating a scream route for 1 scream and protecting route with middleware
app.post("/scream", fbAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.post('/creams/:screamId/comment', fbAuth, commentOnScream)

// User signup route
app.post("/signup", signup);

// User login route
app.post("/login", login);

// upload user image route
app.post('/user/image', fbAuth, uploadImage);

// adding user details route
app.post('/user', fbAuth, addUserDetails);

app.get('/user', fbAuth, getAuthenticatedUser);

exports.api = functions.region("europe-west1").https.onRequest(app); // able to export multiple routes under /api, plus changing region to europe
