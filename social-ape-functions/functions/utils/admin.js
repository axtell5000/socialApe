const admin = require('firebase-admin');

admin.initializeApp();

// Constant
const DB = admin.firestore();

module.exports = { admin, DB};