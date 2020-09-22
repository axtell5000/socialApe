const functions = require("firebase-functions");
const express = require("express");

const {
  getAllScreams,
  postOneScream
} = require('./handlers/screams');
const {
  signup,
  login
} = require('./handlers/users');
const fbAuth = require('./util/fbAuth')

const app = express();

// fetching screams route
app.get("/screams", getAllScreams);

// creating a scream route for 1 scream and protecting route with middleware
app.post("/scream", fbAuth, postOneScream);

// User signup route
app.post("/signup", signup);

// User login route
app.post("/login", login);

exports.api = functions.region("europe-west1").https.onRequest(app); // able to export multiple routes under /api, plus changing region to europe
