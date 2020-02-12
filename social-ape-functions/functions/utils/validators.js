/* isEmpty helper function */
const isEmpty = (string) => {
	if (string.trim() === '') return true;
	else return false;
};

/* Checking if valid email helper function  */
const isEmail = (email) => {
	const emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	if (email.match(emailRegEx)) return true;
	else return false;
};

exports.validateSignupData = (data) => {
	
	/*---------------------------- validating input------------------------------ */
	let errors = {}; // to be use to construct a list of errors

	if (isEmpty(data.email)) {
		errors.email = 'Must not be empty';
	} else if (!isEmail(data.email)) {
		errors.email = 'Must be a valid email address';
	}
	
	// Checking various fields
	if (isEmpty(data.password)) errors.password = 'Must not be empty';
	if (data.password !== data.confirmPasword) errors.confirmPassword = 'Passwords must match';
	if (isEmpty(data.handle)) errors.handle = 'Must not be empty';

	// if legnth equals 0 means there are no errors errors and valid
	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false 
	};
};

exports.validateLoginData = (data) => {
	
	// validating for login
	let errors = {};	

	if (isEmpty(data.email)) errors.email = 'Must not be empty';
	if (isEmpty(data.password)) errors.password = 'Must not be empty';

	// if legnth greater than 0 means there are errors
	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false 
	};
};

exports.reduceUserDetails = (data) => {
	let userDetails = {};

	if (!isEmpty(data.bio.trim())) userDetails.bio = dat.bio;

	if (!isEmpty(data.website.trim())) {
		if (data.website.trim().substring(0, 4) !== 'http') {
			userDetails.website = `http://${data.website.trim()}`;
		}
	}
}