const firebase = require('firebase');

const config = require('../utils/config');
const { DB, admin } = require('../utils/admin');
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../utils/validators');


// Initializing firebase, so we can use firebase authorization
firebase.initializeApp(config);


// to signup user
exports.signup = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPasword: req.body.confirmPassword,
		handle: req.body.handle
	};
	
	const { valid, errors } = validateSignupData(newUser);

	if(!valid) return res.status(400).json(errors);

	const noImg = 'blank-profile-picture-973460_640.png';

	// validate data
	let token, userId;

	DB.doc(`/users/${newUser.handle}`).get()
		.then(doc => {
			if (doc.exists) {
				return res.status(400).json({handle: 'This handle is already taken'})
			} else {
				return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then(data => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then(idToken => {
			token = idToken;
			const userCredentials = {
				handle: newUser.handle,
				email: newUser.email,
				createdAt: new Date().toISOString(),
				imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
				userId
			};

			return DB.doc(`/users/${newUser.handle}`).set(userCredentials);
		})
		.then(() => {
			return res.status(201).json({ token });
		})
		.catch(err => {
			console.error(err);
			if (err.code === 'auth/email-already-in-use') {
				return res.status(400).json({email: 'Email is already in use'})
			} else {
				return res.status(500).json({ error: err.code});
			}
			
		});
		
};

// for logging  in user
exports.login = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	const { valid, errors } = validateLoginData(user);

	if(!valid) return res.status(400).json(errors);


	firebase.auth().signInWithEmailAndPassword(user.email, user.password)
		.then(data => {
			return data.user.getIdToken();
		})
		.then(token => {
			return res.json({ token });
		})
		.catch(err => {
			console.error(err);

			if (err.code === 'auth/wrong-password') {
				return res.status(403).json({ general: 'Wrong credentials, plese try again.' });
			} else {
				return res.status(500).json({ error: err.code });
			}
			
		});
};

// route for adding user details
exports.addUserDetails = (req, res) => {
	let userDetails = reduceUserDetails(req.body);

	DB.doc(`/users/${req.user.handle}`).update(userDetails)
		.then(() => {
			return res.json({message: 'Details added successfully'});
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json({ error: err.code });
		});
};

// Get own user details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  DB.doc(`/users/${req.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return DB
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return DB
        .collection('notifications')
        .where('recipient', '==', req.user.handle)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// route for uploading profile image for user
exports.uploadImage = (req, res) => {
	const BusBoy = require('busboy');
	const path = require('path');
	const os = require('os');
	const fs = require('fs');

	const busboy = new BusBoy({ headers: req.headers });

	let imageToBeUploaded = {};
  let imageFileName;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		console.log(fieldname, file, filename, encoding, mimetype);
		
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }
    
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
   
    imageFileName = `${Math.round(Math.random() * 1000000000000).toString()}.${imageExtension}`;
		
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
	});

	busboy.on('finish', () => {
		admin
			.storage()
			.bucket()
			.upload(imageToBeUploaded.filepath, {
				resumable: false,
				metadata: {
					metadata: {
						contentType: imageToBeUploaded.mimetype
					}
				}
			})
			.then(() => {
				const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
				return DB.doc(`/users/${req.user.handle}`).update({ imageUrl });
			})
			.then(() => {
				return res.json({ message: 'image uploaded successfully' });
			})
			.catch((err) => {
				console.error(err);
				return res.status(500).json({ error: 'something went wrong' });
			});
	});
	busboy.end(req.rawBody);
	
};