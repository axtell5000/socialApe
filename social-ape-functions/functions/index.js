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

// fetching screams route
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

// creating middlemare
const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized user" });
  }

  // here we are checking if token is valid from firebase
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return DB.collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token ", err);
      return res.status(403).json(err);
    });
};

// creating a scream route for 1 scream
app.post("/scream", FBAuth, (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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

// START WITH VALIDATION

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") {
    return true;
  } else {
    return false;
  }
};

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Must not be empty";

  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

  // checking if there are actual errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

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

// login route
app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(user.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(user.password)) errors.password = "Must not be empty";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong password") {
        return res
          .status(403)
          .json({ general: "Wrong login details, please try again" });
      } else {
        return res.status(500).json({
          error: err.code,
        });
      }
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app); // able to export multiple routes under /api, plus changing region to europe
