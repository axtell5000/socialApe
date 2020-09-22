const firebase = require('firebase');

const {
  DB
} = require('../util/admin');
const config = require('../util/config');
const {
  validateSignupData,
  validateLoginData
} = require('../util/validators');

firebase.initializeApp(config);

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const {
    valid,
    errors
  } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  // Here we are checking if userhandle exist in database, cant have user with same handle
  // if handle doesnt exist user can be created
  let token, userId;
  DB.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({
            handle: "This handle has already been taken"
          });
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
      return res.status(201).json({
        token
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({
          email: "Email already in use"
        });
      } else {
        return res.status(500).json({
          error: err.code,
        });
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const {
    valid,
    errors
  } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({
        token
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong password") {
        return res
          .status(403)
          .json({
            general: "Wrong login details, please try again"
          });
      } else {
        return res.status(500).json({
          error: err.code,
        });
      }
    });
}
