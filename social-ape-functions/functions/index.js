const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');
require('dotenv').config();


const firebaseConfig = {
	apiKey: process.env.APIKEY,
	authDomain: process.env.AUTHDOMAIN,
	databaseURL: process.env.DATABASEURL,
	projectId: process.env.PROJECTID,
	storageBucket: process.env.STORAGEBUCKET,
	messagingSenderId: process.env.MESSAGINGSENDERID
};


admin.initializeApp();


// using app
const app = express();

// Initializing firebase, so we can use firebase authorization
firebase.initializeApp(firebaseConfig);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/* Here using nodejs to store functions on firebase. THen we use end points url (like restful api) created in firebase to run them
We can find them in the firebase dashboad. We needed to run firebase deploy to put them in firebase*/
/* Now using express instead */

// Signup route
app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPasword: req.body.confirmPasword,
		handle: req.body.handle
	};

	// todo - validate

	firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
		.then(data => {
			return res.status(201).json({message: `user ${data.user.uid} signed up successfully`})
		})
		.catch((err) => {
			console.error(err);
			return res.status(500).json({ error: err.code});
		});
});


// Get screams route
app.get('/screams', (req, res) => {
	admin.firestore()
	.collection('screams')
	.orderBy('createdAt', 'desc')
	.get()
	.then(data => {
		let screams = [];
		data.forEach(doc => {
			screams.push({
				screamId: doc.id,
				body: doc.data().body,
				userHandle: doc.data().userHandle,
				createdAt: doc.data().createdAt
			});
		});
		
		return res.json(screams);
	})
	.catch(err => console.log(err));
});

// Add a scream route
app.post('/scream', (req, res) => {

	const newScream = {
		body: req.body.body,
		userHandle: req.body.userHandle,
		createdAt: new Date().toISOString()
	};

	

	admin.firestore()
		.collection('screams')
		.add(newScream)
		.then(doc => {
			return res.json({ message: `document ${doc.id} created successfully`});
		})
		.catch(err => {
			res.status(500).json({ error: 'something went wrong'});
			console.error(err);
		});
});

exports.api = functions.region('europe-west1').https.onRequest(app); // registering app with routes