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
// Previous Sunday
var s0 = new Date();
s0.setUTCDate(s0.getUTCDate() + ((7-s0.getUTCDay()) % 7) - 7);
s0.setUTCHours(8,0,0,0);

// Convert dates to readable string
var sunday1 = getFormattedDate(s1);
var sunday2 = getFormattedDate(s2);
var sunday3 = getFormattedDate(s3);
var sunday0 = getFormattedDate(s0);

// Convert dates to readable document IDs
var sundayDoc1 = getFormattedDateDocument(s1);
var sundayDoc2 = getFormattedDateDocument(s2);
var sundayDoc3 = getFormattedDateDocument(s3);
var sundayDoc0 = getFormattedDateDocument(s0);

// Convert dates into Firestore timestamps
var timestampS1 = firebase.firestore.Timestamp.fromDate(s1);
var timestampS2 = firebase.firestore.Timestamp.fromDate(s2);
var timestampS3 = firebase.firestore.Timestamp.fromDate(s3);
var timestampS0 = firebase.firestore.Timestamp.fromDate(s0);

// List of next 3 sundays (plus previous Sunday)
var nextSundays = [sunday0, sunday1, sunday2, sunday3]
console.log("service dates: ", nextSundays);

// add current week to header
document.getElementById("currentWeekDisplay").innerHTML+= sunday1;

// get current list of registrants
var docRef = db.collection("registrations").doc(sundayDoc1);

docRef.get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data());
        // get current list of registrants
        let regObjList = doc.data()['registrants'].sort((a, b) => (a.firstName > b.firstName) ? 1 : -1);
        let regList = regObjList.map(x => x.firstName + " " + x.lastName + ", email: " + checkEmailEmpty(x.email));
        // display current number of registrants
        document.getElementById("numRegistered").innerHTML = regList.length;
        // display current list of registrants
        document.getElementById("registrantsList").innerHTML = '<ul><li>' + regList.join("</li><li>"); + '</li></ul>';
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        // display that there are no registrants
        document.getElementById("numRegistered").innerHTML = "0";
        document.getElementById("registrantsList").innerHTML = "No registrations!";
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
});

// fill in list of other Sundays to check
document.getElementById("option0").value = sundayDoc0;
document.getElementById("option0").innerHTML = sunday0;
document.getElementById("option1").value = sundayDoc1;
document.getElementById("option1").innerHTML = sunday1;
document.getElementById("option2").value = sundayDoc2;
document.getElementById("option2").innerHTML = sunday2;
document.getElementById("option3").value = sundayDoc3;
document.getElementById("option3").innerHTML = sunday3;


// checks if the email variable is empty and reassigns to n/a
function checkEmailEmpty(email){
    if(email){
        return email;
    }
    return "n/a";
}


// get list of registrants for different date
function changeServiceDate(){
    // get new date from dropdown
    var newServiceDate = document.getElementById("serviceDateDropdown");
    console.log(newServiceDate.value);

    // set current week to header
    document.getElementById("currentWeekDisplay").innerHTML = newServiceDate.options[newServiceDate.selectedIndex].text;

    // get current list of registrants
    var newDoc = db.collection("registrations").doc(newServiceDate.value);

    newDoc.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            // get current list of registrants
            let regObjList = doc.data()['registrants'].sort((a, b) => (a.firstName > b.firstName) ? 1 : -1);
            let regList = regObjList.map(x => x.firstName + " " + x.lastName);
            // display current number of registrants
            document.getElementById("numRegistered").innerHTML = regList.length;
            // display current list of registrants
            document.getElementById("registrantsList").innerHTML = '<ul><li>' + regList.join("</li><li>"); + '</li></ul>';
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            // display that there are no registrants
            document.getElementById("numRegistered").innerHTML = "0";
            document.getElementById("registrantsList").innerHTML = "No registrations!";
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
}