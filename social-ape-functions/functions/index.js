const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");
const fbAuth = require("./util/fbAuth");

const { DB } = require("./util/admin");

const app = express();
app.use(cors());

// fetching screams route
app.get("/screams", getAllScreams);

// creating a scream route for 1 scream and protecting route with middleware
app.post("/scream", fbAuth, postOneScream);
app.get("/scream/:screamId", getScream);
app.post("/scream/:screamId/comment", fbAuth, commentOnScream);
app.get("/scream/:screamId/like", fbAuth, likeScream);
app.get("/scream/:screamId/unlike", fbAuth, unlikeScream);
app.delete("/scream/:screamId", fbAuth, deleteScream);
// User signup route
app.post("/signup", signup);

// User login route
app.post("/login", login);

// upload user image route
app.post("/user/image", fbAuth, uploadImage);

// adding user details route
app.post("/user", fbAuth, addUserDetails);

app.get("/user", fbAuth, getAuthenticatedUser);

app.get("/user/:handle", getUserDetails);
app.post("/notifications", fbAuth, markNotificationsRead);

exports.api = functions.region("europe-west1").https.onRequest(app); // able to export multiple routes under /api, plus changing region to europe

// creating firestore triggers, something happens when a certain thing happens
exports.createNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onCreate((snapshot) => {
    return DB.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return DB.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .catch((err) => console.error(err));
  });

// when you unlike a scream, send notification once like deleted
exports.deleteNotificationOnUnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onDelete((snapshot) => {
    return DB.doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

// trigger for on comment
exports.createNotificationOnComment = functions
  .region("europe-west1")
  .firestore.document("comments/{id}")
  .onCreate((snapshot) => {
    return DB.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return DB.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

// firestore trigger, when user changes userImage the changes are filtered down to any comment user has made
exports.onUserImageChange = functions
  .region("europe-west1")
  .firestore.document("/users/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = DB.batch();
      return DB.collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = DB.doc(`/screams/${doc.id}`);
            batch.update(scream, {
              userImage: change.after.data().imageUrl,
            });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions
  .region("europe-west1")
  .firestore.document("/screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = DB.batch();
    return DB.collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(DB.doc(`/comments/${doc.id}`));
        });
        return DB.collection("likes").where("screamId", "==", screamId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(DB.doc(`/likes/${doc.id}`));
        });
        return DB.collection("notifications")
          .where("screamId", "==", screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(DB.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
