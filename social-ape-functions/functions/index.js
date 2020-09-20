const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const firebase = require("firebase");

const config = {
  apiKey: "AIzaSyCs9WnDwOGMIHgxGi9LeLm4JKSCgoRfArk",
  authDomain: "socialape-89327.firebaseapp.com",
  databaseURL: "https://socialape-89327.firebaseio.com",
  projectId: "socialape-89327",
  storageBucket: "socialape-89327.appspot.com",
  messagingSenderId: "959132455621",
  appId: "1:959132455621:web:58f0781eac76f1fca916ac",
  measurementId: "G-CD5QNQT7D6",
};

admin.initializeApp();
const app = express();
const DB = admin.firestore();

firebase.initializeApp(config);

app.get("/screams", (req, res) => {
  DB.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  DB.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({
        message: `document ${doc.id} created successfully`,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Something went wrong",
      });
      console.error(err);
    });
});

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  // TODO - validate

  // Here we are checking if userhandle exist in database, cant have user with same handle
  // if handle doesnt exist user can be created
  let token, userId;
  DB.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: "This handle has already been taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      // to add users in our database not just under authentication
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return DB.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email already in use" });
      } else {
        return res.status(500).json({
          error: err.code,
        });
      }
    });
});
exports.api = functions.region("europe-west1").https.onRequest(app); // able to export multiple routes under /api, plus changing region to europe
