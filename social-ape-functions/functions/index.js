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

// Constant
const DB = admin.firestore();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/* Here using nodejs to store functions on firebase. THen we use end points url (like restful api) created in firebase to run them
We can find them in the firebase dashboad. We needed to run firebase deploy to put them in firebase*/
/* Now using express instead */

/* isEmpty helper function */
const isEmpty = (string) => {
	if (string.trim() === '') return true;
	else return false;
}

/* Checking if valid email helper function  */
const isEmail = (email) => {
	const emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	if (email.match(emailRegEx)) return true;
	else return false;
}


/*------------------------------------------------------------------------------------------------------------------------------
																										SIGNUP ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/
app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPasword: req.body.confirmPasword,
		handle: req.body.handle
	};

	/*---------------------------- validating input------------------------------ */
	let errors = {}; // to be use to construct a list of errors

	if (isEmpty(newUser.email)) {
		errors.email = 'Must not be empty';
	} else if (!isEmail(newUser.email)) {
		errors.email = 'Must be a valid email address';
	}

	// Checking various fields
	if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
	if (newUser.password !== newUser.confirmPasword) errors.confirmPassword = 'Passwords must match';
	if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

	// if legth greater than 0 means there are errors
	if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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
			
		})


});

/*------------------------------------------------------------------------------------------------------------------------------
																									GET SCREAMS ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/
app.get('/screams', (req, res) => {
	DB
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

/*------------------------------------------------------------------------------------------------------------------------------
																									ADD A SCREAEM ROUTE
-------------------------------------------------------------------------------------------------------------------------------*/

app.post('/scream', (req, res) => {

	const newScream = {
		body: req.body.body,
		userHandle: req.body.userHandle,
		createdAt: new Date().toISOString()
	};	

	DB
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