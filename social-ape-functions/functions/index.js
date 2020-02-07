const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/* Here using nodejs to store functions on firebase. THen we use end points url (like restful api) created in firebase to run them
We can find them in the firebase dashboad. We needed to run firebase deploy to put them in firebase*/

exports.helloWorld = functions.https.onRequest((request, response) => {
	response.send("Hello , whats cracking");
});

exports.getScreams = functions.https.onRequest((req, res) => {
	admin.firestore().collection('screams').get()
		.then(data => {
			let screams = [];
			data.forEach(doc => {
				screams.push(doc.data());
			});
			return res.json(screams);
		})
		.catch(err => console.log(err));
});

exports.createScream = functions.https.onRequest((req, res) => {

	const newScream = {
		body: req.body.body,
		userHandle: req.body.userHandle,
		createdAt: admin.firestore.Timestamp.fromDate(new Date())
	};

	admin.firestore()
		.collection('screams')
		.add(newScream)
		.then(doc => {
			res.json({ message: `document ${doc.id} created successfully`});
		})
		.catch(err => {
			res.status(500).json({ error: 'something went wrong'});
			console.error(err);
		});
});
