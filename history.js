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

//get dropdown element
select = document.getElementById('serviceDateDropdown');

db.collection("registrations").get().then(function(querySnapshot) {

    // get all existing service dates and fill in dropdown
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());

        // get date from each document
        let date = doc.id;

        // fill in dropdown with all dates
        let opt = document.createElement('option');
        opt.value = date;
        opt.innerHTML = date;
        select.appendChild(opt);
    });
});


// get list of registrants for different date
function getRegistrations(){
    // get new date from dropdown
    var newServiceDate = document.getElementById("serviceDateDropdown");
    console.log(newServiceDate.value);

    // set current week to header
    document.getElementById("currentWeekDisplay").innerHTML = newServiceDate.value;

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