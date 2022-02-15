// Fill in next 3 Sundays
//date formatting function
function getFormattedDate(date) {
    let year = date.getUTCFullYear();
    let month = (1 + date.getUTCMonth()).toString().padStart(2, '0');
    let day = date.getUTCDate().toString().padStart(2, '0');

    return month + '/' + day + '/' + year;
}

//format date for document id
function getFormattedDateDocument(date) {
    let year = date.getUTCFullYear();
    let month = (1 + date.getUTCMonth()).toString().padStart(2, '0');
    let day = date.getUTCDate().toString().padStart(2, '0');

    return month + '.' + day + '.' + year;
}

// format name (remove trailing/leading whitespace and capitalize first letter)
function formatName(string) {
    // remove trailing/leading whitespace
    var noWhiteSpaceString = string.replace(/^\s+|\s+$/g, '');
    // uncapitalize all letters
    var uncapitalizedString = noWhiteSpaceString.toLowerCase();
    // make all spaces single
    uncapitalizedString = uncapitalizedString.replace(/\s\s+/g, ' ');
    // capitalize first letter of each separate word
    const words = uncapitalizedString.split(' ');
    console.log("split string: ", words)
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    // recombine words into single name
    var formattedString = words.join(" ");
    console.log("formatted string: ", formattedString);
    return formattedString;
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyBhvsJ8vGMkchg0CXyIeq8oYFWkEIZS2DY",
    authDomain: "weekly-event-registration.firebaseapp.com",
    projectId: "weekly-event-registration",
    storageBucket: "weekly-event-registration.appspot.com",
    messagingSenderId: "117244024633",
    appId: "1:117244024633:web:d49e03366fb4ca074f3ae8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var db = firebase.firestore();

// Next Sunday (or today if today is sunday) in PST
var s1 = new Date();
s1.setUTCDate(s1.getUTCDate() + ((7-s1.getUTCDay()) % 7));
s1.setUTCHours(8,0,0,0);

// Next next Sunday
var s2 = new Date();
s2.setUTCDate(s2.getUTCDate() + ((7-s2.getUTCDay()) % 7) + 7);
s2.setUTCHours(8,0,0,0);
// Third Sunday
var s3 = new Date();
s3.setUTCDate(s3.getUTCDate() + ((7-s3.getUTCDay()) % 7) + 14);
s3.setUTCHours(8,0,0,0);

// Convert dates to readable string
var sunday1 = getFormattedDate(s1);
var sunday2 = getFormattedDate(s2);
var sunday3 = getFormattedDate(s3);

// Convert dates to readable document IDs
var sundayDoc1 = getFormattedDateDocument(s1);
var sundayDoc2 = getFormattedDateDocument(s2);
var sundayDoc3 = getFormattedDateDocument(s3);

// Convert dates into Firestore timestamps
var timestampS1 = firebase.firestore.Timestamp.fromDate(s1);
var timestampS2 = firebase.firestore.Timestamp.fromDate(s2);
var timestampS3 = firebase.firestore.Timestamp.fromDate(s3);

// List of next 3 sundays
var nextSundays = [sunday1, sunday2, sunday3]
console.log("service dates: ", nextSundays);

// Convert dates into firestore values and set as checkbox values
document.getElementById("date1").value = timestampS1;
document.getElementById("datelabel1").innerHTML = nextSundays[0];
document.getElementById("date2").value = timestampS2;
document.getElementById("datelabel2").innerHTML = nextSundays[1];
document.getElementById("date3").value = timestampS3;
document.getElementById("datelabel3").innerHTML = nextSundays[2];

// Set checkbox values for cancel tab
document.getElementById("datecancel1").value = timestampS1;
document.getElementById("datecancellabel1").innerHTML = nextSundays[0];
document.getElementById("datecancel2").value = timestampS2;
document.getElementById("datecancellabel2").innerHTML = nextSundays[1];
document.getElementById("datecancel3").value = timestampS3;
document.getElementById("datecancellabel3").innerHTML = nextSundays[2];

// Submit registration form and switch to submitted tab

function submitRegistrationForm(){

    // check for valid first name
    var firstName = document.getElementById("firstname");
    if (!firstName.checkValidity()) {
        document.getElementById("firstNameWarning").innerHTML = "Please enter your first name.";
        document.getElementById("validationMessage").innerHTML = "Please fill out all the fields.";
        return;
    }
    // check for valid last name
    var lastName = document.getElementById("lastname");
    if (!lastName.checkValidity()) {
        document.getElementById("lastNameWarning").innerHTML = "Please enter your last name.";
        document.getElementById("validationMessage").innerHTML = "Please fill out all the fields.";
        return;
    }
    // check if valid email
    var email = document.getElementById("email");
    if (!email.checkValidity()) {
        document.getElementById("emailWarning").innerHTML = "Please enter your email.";
        document.getElementById("validationMessage").innerHTML = "Please fill out all the fields.";
        return;
    }
    // see which checkboxes are checked
    var checkbox1 = document.getElementById("date1");
    var checkbox2 = document.getElementById("date2");
    var checkbox3 = document.getElementById("date3");

    if (!checkbox1.checked && !checkbox2.checked && !checkbox3.checked){
        document.getElementById("dateWarning").innerHTML = "Please choose at least one service date.";
        document.getElementById("validationMessage").innerHTML = "Please fill out all the fields.";
        return;
    }

    // ensure that agreement is checked
    var agreementCheck = document.getElementById("agreement");
    if (!agreementCheck.checked){
        document.getElementById("agreementWarning").innerHTML = "Agreement is required to register.";
        document.getElementById("validationMessage").innerHTML = "Please fill out all the fields.";
        return;
    }

    // add name to the list of registrants for each date (if checked)

    // for date 1
    if (checkbox1.checked){
        const serviceDate1 = db.collection("registrations").doc(sundayDoc1);

        serviceDate1.get().then(function(doc) {
            if (doc.exists) {
                // if service date exists, add registrant to registrants array
                // Atomically add a new registrant to the "registrants" array field.
                serviceDate1.update({
                    registrants: firebase.firestore.FieldValue.arrayUnion({
                        lastName: formatName(lastName.value),
                        firstName: formatName(firstName.value),
                        email: formatName(email.value)
                    })
                });
            } else {
                // if service date does not exist, create the document

                let docData = {
                    date: timestampS1,
                    registrants: [{
                        lastName: formatName(lastName.value),
                        firstName: formatName(firstName.value),
                        email: formatName(email.value)
                    }]
                };
                serviceDate1.set(docData);
            }
        }).catch(function(error) {
            console.log("Error getting date 1:", error);
        });
    }

    // for date 2
    if (checkbox2.checked){

        const serviceDate2 = db.collection("registrations").doc(sundayDoc2);

        serviceDate2.get().then(function(doc) {
            if (doc.exists) {
                // if service date exists, add registrant to registrants array
                // Atomically add a new registrant to the "registrants" array field.
                serviceDate2.update({
                    registrants: firebase.firestore.FieldValue.arrayUnion({
                        lastName: formatName(lastName.value),
                        firstName: formatName(firstName.value),
                        email: formatName(email.value)
                    })
                });
            } else {
                // if service date does not exist, create the document

                let docData = {
                    date: timestampS2,
                    registrants: [{
                        lastName: formatName(lastName.value),
                        firstName: formatName(firstName.value),
                        email: formatName(email.value)
                    }]
                };
                serviceDate2.set(docData);
            }
        }).catch(function(error) {
            console.log("Error getting date 2:", error);
        });
    }

    // for date 3
    if (checkbox3.checked){

        const serviceDate3 = db.collection("registrations").doc(sundayDoc3);

        serviceDate3.get().then(function(doc) {
            if (doc.exists) {
                // if service date exists, add registrant to registrants array
                // Atomically add a new registrant to the "registrants" array field.
                serviceDate3.update({
                    registrants: firebase.firestore.FieldValue.arrayUnion({
                        lastName: formatName(lastName.value),
                        firstName: formatName(firstName.value),
                        email: formatName(email.value)
                    })
                });
            } else {
                // if service date does not exist, create the document

                let docData = {
                    date: timestampS3,
                    registrants: [{
                        lastName: formatName(lastName.value),
                        firstName: formatName(firstName.value),
                        email: formatName(email.value)
                    }]
                };
                serviceDate3.set(docData);
            }
        }).catch(function(error) {
            console.log("Error getting date 3:", error);
        });
    }

    // switch tabs from registration to registration completed
    var currTab, newTab;
    currTab = document.getElementById("registrationFormTab");
    newTab = document.getElementById("registrationFormSubmittedTab");
    currTab.style.display = "none";
    newTab.style.display = "block";
}

// Check registration and switch to registration status tab
function submitCheckForm(){

    // check for valid first name
    var firstNameCheck = document.getElementById("firstnameCheck");
    if (!firstNameCheck.checkValidity()) {
        document.getElementById("firstNameCheckWarning").innerHTML = "Please enter your first name.";
        document.getElementById("validationMessageCheck").innerHTML = "Please fill out all the fields.";
        return;
    }
    // check for valid last name
    var lastNameCheck = document.getElementById("lastnameCheck");
    if (!lastNameCheck.checkValidity()) {
        document.getElementById("lastNameCheckWarning").innerHTML = "Please enter your last name.";
        document.getElementById("validationMessageCheck").innerHTML = "Please fill out all the fields.";
        return;
    }

    // add name to status header
    document.getElementById("regStatusNameDisplay").innerHTML+= formatName(firstNameCheck.value);
    document.getElementById("regStatusNameDisplay").innerHTML+= " ";
    document.getElementById("regStatusNameDisplay").innerHTML+= formatName(lastNameCheck.value);

    // UNNEEDED: create registrant object to check for existence in registrations
    var checkUser = {firstName: firstNameCheck.value, lastName: lastNameCheck.value};

    // TODO: display dates registered for
    
    // get list of registrants for next 3 services
    const serviceDate1 = db.collection("registrations").doc(sundayDoc1);
    const serviceDate2 = db.collection("registrations").doc(sundayDoc2);
    const serviceDate3 = db.collection("registrations").doc(sundayDoc3);

    // Check if registered for next service
    serviceDate1.get().then(function(doc) {
        if (doc.exists) {
            // get list of registrants for certain date
            let regList = doc.data()['registrants'];

            // if name registered for specific date, show 'yes'
            // if not registered, show 'no'
            if (regList.filter(function(e) { return e.firstName == formatName(firstNameCheck.value) && e.lastName == formatName(lastNameCheck.value); }).length > 0) {
                document.getElementById("upcomingServicesRegistered").innerHTML += sunday1;
                document.getElementById("upcomingServicesRegistered").innerHTML += ': Registered!<br>';
            }
            else{
                document.getElementById("upcomingServicesRegistered").innerHTML += sunday1;
                document.getElementById("upcomingServicesRegistered").innerHTML += ': Not registered.<br>';
            }
        } else {
            // if service date doesn't exist, do nothing
        }
    }).catch(function(error) {
        console.log("Error getting date 1:", error);
    });

    // Check if registered for next next service
    serviceDate2.get().then(function(doc) {
        if (doc.exists) {
            // get list of registrants for certain date
            let regList = doc.data()['registrants'];

            // if name registered for specific date, show 'yes'
            // if not registered, show 'no'
            if (regList.filter(function(e) { return e.firstName == formatName(firstNameCheck.value) && e.lastName == formatName(lastNameCheck.value); }).length > 0) {
                document.getElementById("upcomingServicesRegistered").innerHTML += sunday2;
                document.getElementById("upcomingServicesRegistered").innerHTML += ': Registered!<br>';
            }
            else{
                document.getElementById("upcomingServicesRegistered").innerHTML += sunday2;
                document.getElementById("upcomingServicesRegistered").innerHTML += ': Not registered.<br>';
            }
        } else {
            // if service date doesn't exist, do nothing
        }
    }).catch(function(error) {
        console.log("Error getting date 2:", error);
    });

    // Check if registered for 3rd service
    serviceDate3.get().then(function(doc) {
        if (doc.exists) {
            // get list of registrants for certain date
            let regList = doc.data()['registrants'];

            // if name registered for specific date, show 'yes'
            // if not registered, show 'no'
            if (regList.filter(function(e) { return e.firstName == formatName(firstNameCheck.value) && e.lastName == formatName(lastNameCheck.value); }).length > 0) {
                document.getElementById("upcomingServicesRegistered").innerHTML += sunday3;
                document.getElementById("upcomingServicesRegistered").innerHTML += ': Registered!<br>';
            }
            else{
                document.getElementById("upcomingServicesRegistered").innerHTML += sunday3;
                document.getElementById("upcomingServicesRegistered").innerHTML += ': Not registered.<br>';
            }
        } else {
            // if service date doesn't exist, do nothing
        }
    }).catch(function(error) {
        console.log("Error getting date 3:", error);
    });

    // switch tabs from check registration to registration status tab
    var currTab, newTab;
    currTab = document.getElementById("checkRegistrationTab");
    newTab = document.getElementById("registrationStatusTab");
    currTab.style.display = "none";
    newTab.style.display = "block";
}  


function cancelRegistration(){
    // check for valid first name
    var firstName = document.getElementById("firstNameCancel");
    if (!firstName.checkValidity()) {
        document.getElementById("firstNameCancelWarning").innerHTML = "Please enter your first name.";
        document.getElementById("validationMessageCancel").innerHTML = "Please fill out all the fields.";
        return;
    }
    // check for valid last name
    var lastName = document.getElementById("lastNameCancel");
    if (!lastName.checkValidity()) {
        document.getElementById("lastNameCancelWarning").innerHTML = "Please enter your last name.";
        document.getElementById("validationMessageCancel").innerHTML = "Please fill out all the fields.";
        return;
    }
    // see which checkboxes are checked
    var checkbox1 = document.getElementById("datecancel1");
    var checkbox2 = document.getElementById("datecancel2");
    var checkbox3 = document.getElementById("datecancel3");

    // make sure at least one date checked
    if (!checkbox1.checked && !checkbox2.checked && !checkbox3.checked){
        document.getElementById("dateCancelWarning").innerHTML = "Please choose at least one service date.";
        document.getElementById("validationMessageCancel").innerHTML = "Please fill out all the fields.";
        return;
    }
    
    // for date 1
    if (checkbox1.checked){

    const serviceDate1 = db.collection("registrations").doc(sundayDoc1);

    serviceDate1.get().then(function(doc) {
        if (doc.exists) {
            // if service date exists, remove person from list of registrants.
            serviceDate1.update({
                registrants: firebase.firestore.FieldValue.arrayRemove({
                    lastName: formatName(lastName.value),
                    firstName: formatName(firstName.value)
                })
            });
        } else {
            // if service date does not exist, do nothing
        }
    }).catch(function(error) {
        console.log("Error removing date 1:", error);
    });
    }

    // for date 2
    if (checkbox2.checked){

    const serviceDate2 = db.collection("registrations").doc(sundayDoc2);

    serviceDate2.get().then(function(doc) {
        if (doc.exists) {
            // if service date exists, remove person from list of registrants.
            serviceDate2.update({
                registrants: firebase.firestore.FieldValue.arrayRemove({
                    lastName: formatName(lastName.value),
                    firstName: formatName(firstName.value)
                })
            });
        } else {
            // if service date does not exist, do nothing
        }
    }).catch(function(error) {
        console.log("Error removing date 2:", error);
    });
    }

    // for date 3
    if (checkbox3.checked){

    const serviceDate3 = db.collection("registrations").doc(sundayDoc3);

    serviceDate3.get().then(function(doc) {
        if (doc.exists) {
            // if service date exists, remove person from list of registrants.
            serviceDate3.update({
                registrants: firebase.firestore.FieldValue.arrayRemove({
                    lastName: formatName(lastName.value),
                    firstName: formatName(firstName.value)
                })
            });
        } else {
            // if service date does not exist, do nothing
        }
    }).catch(function(error) {
        console.log("Error removing date 3:", error);
    });
    }

    // switch tabs from check registration to registration status tab
    var currTab, newTab;
    currTab = document.getElementById("cancelRegTab");
    newTab = document.getElementById("cancelCompleteTab");
    currTab.style.display = "none";
    newTab.style.display = "block";

}

function updateCheckForm(){
    // reset status display
    document.getElementById("regStatusNameDisplay").innerHTML = "";
    document.getElementById("upcomingServicesRegistered").innerHTML = "";
    // submit old form data again
    submitCheckForm();
}