const {
  DB
} = require("../util/admin");

exports.getAllScreams = (req, res) => {
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
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
        console.log(data, 'tt');
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
};

exports.postOneScream = (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  DB.collection("screams")
    .add(newScream)
    .then((doc) => {
      const resScream = newScream;
      resScream.screamId = doc.id;
      res.json(resScream);
    })
    .catch((err) => {
      res.status(500).json({
        error: "Something went wrong",
      });
      console.error(err);
    });
};

// Fetch one scream
exports.getScream = (req, res) => {
  let screamData = {};
  DB.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({
          error: "Scream not found",
        });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return DB.collection("comments")
        .orderBy("createdAt", "desc")
        .where("screamId", "==", req.params.screamId)
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: err.code,
      });
    });
};

// Comment on a comment
exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({
      comment: "Must not be empty",
    });
  }

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };
  console.log(newComment);

  DB.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({
          error: "Scream not found",
        });
      }
      return doc.ref.update({
        commentCount: doc.data().commentCount + 1,
      });
    })
    .then(() => {
      return DB.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Something went wrong",
      });
    });
};

// Liking a scream
exports.likeScream = (req, res) => {
  const likeDocument = DB.collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);
  console.log(req.params.screamId, 'back')
  const screamDocument = DB.doc(`/screams/${req.params.screamId}`);

  let screamData;

  screamDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({
          error: "Scream not found",
        });
      }
    })
    .then((data) => {
      if (data.empty) {
        return DB.collection("likes")
          .add({
            screamId: req.params.screamId,
            userHandle: req.user.handle,
          })
          .then(() => {
            screamData.likeCount++;
            return screamDocument.update({
              likeCount: screamData.likeCount,
            });
          })
          .then(() => {
            return res.json(screamData);
          });
      } else {
        return res.status(400).json({
          error: "Scream already liked",
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: err.code,
      });
    });
};

exports.unlikeScream = (req, res) => {
  const likeDocument = DB.collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);

  const screamDocument = DB.doc(`/screams/${req.params.screamId}`);

  let screamData;

  screamDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({
          error: "Scream not found",
        });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({
          error: "Scream not liked",
        });
      } else {
        return DB.doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            screamData.likeCount--;
            return screamDocument.update({
              likeCount: screamData.likeCount,
            });
          })
          .then(() => {
            res.json(screamData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: err.code,
      });
    });
};

// Delete a scream
exports.deleteScream = (req, res) => {
  const document = DB.doc(`/screams/${req.params.screamId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({
          error: "Scream not found",
        });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({
          error: "Unauthorized",
        });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({
        message: "Scream deleted successfully",
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        error: err.code,
      });
    });
};
