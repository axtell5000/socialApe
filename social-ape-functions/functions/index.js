const functions = require('firebase-functions');
const express = require('express');


const { DB } = require('./utils/admin');
const  FBAuth  = require('./utils/fbAuth');

const { 
	getAllScreams, 
	postOneScream, 
	getScream, 
	commentOnScream, 
	likeScream, 
	unlikeScream,
	deleteScream } = require('./handlers/screams');

const { 
	login, 
	signup, 
	uploadImage, 
	addUserDetails, 
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
 } = require('./handlers/users');

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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);


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

// like / unlike scream
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

app.delete('/scream/:screamId', FBAuth, deleteScream);

exports.api = functions.region('europe-west1').https.onRequest(app); // registering app with routes

/*------------------------Notification-----------------------------*/
/* Here we are leveraging Firebase's built in events that gets fired when changes are done on the database
For example onCreate is one */

exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return DB
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
          return DB.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
	});

	exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return DB
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
          return DB.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
	
	exports.deleteNotificationOnUnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return DB
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });