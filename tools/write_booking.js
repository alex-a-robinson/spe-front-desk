'use strict';

var admin = require("firebase-admin");


function write_recent_booking(snapshot) {
    var id = snapshot.key;
    admin.database().ref('recent_bookings/' + id).set(id).catch(function(error) {
        console.error('Error writing recent booking', error);
    });
}

function write_booking(email, timestamp) {
    admin.database().ref('bookings').push({
        email: email,
        timestamp: timestamp,
    }).catch(function(error) {
        console.error('Error writing new booking', error);
    });
}

function write_rfid(rfid, booking_id, uid) {
    admin.database().ref('rfids/' + rfid).set({
        booking_id: booking_id,
        uid: uid,
    }).catch(function(error) {
        console.error('Error writing new booking', error);
    });
}

admin.initializeApp({
    databaseURL: "https://spe-elabs.firebaseio.com",
    credential: admin.credential.cert(require("service.json")),
    databaseAuthVariableOverride: {
        uid: "booking-service"
    }
});

admin.auth();
admin.database().ref('bookings').once('child_added', write_recent_booking);
admin.database().ref('recent_bookings').once('value', function() {
    process.exit(0)
});

// ---- DO YOUR CHANGES HERE ----
write_booking('dan@testmail.com', 123);
