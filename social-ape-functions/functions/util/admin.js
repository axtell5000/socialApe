const admin = require("firebase-admin");

admin.initializeApp();

const DB = admin.firestore();

module.exports = {
  admin,
  DB
};
