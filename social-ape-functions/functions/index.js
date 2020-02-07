const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/* Here using nodejs to store functions on firebase. THen we use end points url (like restful api) created in firebase to run them
We can find them in the firebase dashboad. We needed to run firebase deploy to put them in firebase*/
/* Now using express instead */


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

exports.api = functions.https.onRequest(app); // registering app with routes